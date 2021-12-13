const EventController = require('../modele/eventDB');
const AddressController = require('../modele/addressDB');
const MessageController = require('../modele/messageDB');
const InscriptionController = require('../modele/inscriptionDB');
const pool = require('../modele/database');
const {add} = require("nodemon/lib/rules");

/**
 * @swagger
 *  components:
 *      responses:
 *          EvenementInseré:
 *              description: L'évenement a été ajouté à la base de donnée
 *      requestBodies:
 *          EvenementInseré:
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              creatorId:
 *                                  type: integer
 *                              gameCategoryId:
 *                                  type: integer
 *                              eventDate:
 *                                  type: string (MM-DD-YYYY)
 *                              place:
 *                                  type: string
 *                              eventDescription:
 *                                  type: string
 *                              nbMaxPlayer:
 *                                  type: integer
 *
 *                          required:
 *                              - creatorId
 *                              - gameCategoryId
 *                              - eventDate
 *                              - place
 *                              - eventDescription
 *                              - nbMaxPlayer
 */
module.exports.insertEvent = async (req, res) => {
    const {creatorId, gameCategoryId, eventDate, eventDescription, nbMaxPlayer, street, number, city,
        postalCode, country} = req.body;
    const client = await pool.connect();
    try{
        await client.query("BEGIN");
        const addressId = await AddressController.insertAddress(client, street, number, city, postalCode, country);
        await EventController.insertEvent(client, creatorId, gameCategoryId, eventDate, addressId, eventDescription, nbMaxPlayer);
        await client.query("COMMIT");
        res.sendStatus(201);
    } catch (e){
        await client.query("ROLLBACK");
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

/**
 *@swagger
 *components:
 *  responses:
 *      EvènementSupprimé:
 *          description: L'évènement a été supprimé
 */
module.exports.deleteEvent = async (req, res) => {
    const reqId = req.session.id;
    const eventId = req.params.id;
    const client = await pool.connect();
    try{
        const ownerId = await EventController.getEventOwner(client, eventId);
        if (reqId === ownerId || req.session.authLevel === 'admin'){ //Vérification si Admin ou Créateur de l'event
            await client.query(`BEGIN`);

            //Suppression de tout ce qui est lié à un event
            await AddressController.deleteAddressWithEvent(client, eventId);
            await MessageController.deleteMessageWithEvent(client, eventId);
            await InscriptionController.deleteAllFromEvent(client, eventId);
            //Suppression de l'event
            await EventController.deleteEvent(client, eventId);

            await client.query("COMMIT");
            res.sendStatus(204);
        }else{
            res.sendStatus(403);
        }
    } catch (e) {
        console.error(e);
        await client.query(`ROLLBACK`);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getEvent = async (req, res) => {
    const eventId = req.params.id;
    const client = await pool.connect();
    try{
        const result = await EventController.getEvent(client, eventId);
        res.json(result);
    } catch (e){
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.getAllEvent = async (req, res) => {
    const client = await pool.connect();
    try{
        const result = await EventController.getAllEvent(client);
        if(result.length !== 0)
            res.json(result);
        else
            res.sendStatus(404);
    } catch (e) {
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.getAllEventByUser = async(req, res) => {
    const userId = req.params.id;
    const client = await pool.connect();
    try{
        const result = await EventController.getAllEventByUser(client, userId);
        res.json(result);
    } catch (e){
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.getAllJoinedEvent = async(req, res) => {
    const userId = req.params.id;
    const client = await pool.connect();
    try{
        const result = await EventController.getAllJoinedEvent(client, userId);
        res.json(result);
    } catch (e){
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}


//todo : Pas nécessaire jusqu'ici. Peut-on la supprimer ?
module.exports.getEventOwner = async (req, res) => {
    const client = await pool.connect();
    const eventId = req.params.id;
    try{
        const ownerId = await EventController.getEventOwner(client, eventId)
        res.json(ownerId);
    } catch (e){
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}



/**
 * @swagger
 *  components:
 *      responses:
 *          EventUpdate:
 *              description: L'évènement a été mis à jour
 *      requestBodies:
 *          EventUpdate:
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              eventDate:
 *                                  type: string
 *                              place:
 *                                  type: string
 *                              eventDescription:
 *                                  type: string
 *                              nbMaxPlayer:
 *                                  type: integer
 *                              gameCategoryId:
 *                                  type: integer
 */
module.exports.modifyEvent = async(req, res) => {
    const reqId = req.session.id
    let doUpdateEvent = false;
    let doUpdateAddress = false;
    let toUpdate = req.body;
    const eventId = req.params.id;
    const newData = {};

    if (toUpdate.eventDate !== undefined || toUpdate.place !== undefined || toUpdate.eventDescription !== undefined ||
        toUpdate.nbMaxPlayer !== undefined || toUpdate.gameCategoryId !== undefined) {
        doUpdateEvent = true;
    }
    if(toUpdate.street !== undefined || toUpdate.number !== undefined || toUpdate.city !== undefined ||
        toUpdate.postCode !== undefined || toUpdate.country !== undefined)
        doUpdateAddress = true;

    if (doUpdateEvent || doUpdateAddress){
        if(doUpdateEvent){
            newData.gameCategoryId = toUpdate.gameCategoryId;
            newData.eventDate = toUpdate.eventDate;
            newData.eventDescription = toUpdate.eventDescription;
            newData.nbMaxPlayer = toUpdate.nbMaxPlayer;
        }
        if(doUpdateAddress){
            newData.street = toUpdate.street;
            newData.number = toUpdate.number;
            newData.city = toUpdate.city;
            newData.postCode = toUpdate.postCode;
            newData.country = toUpdate.country;
        }

        const client = await pool.connect();
        try{
            const ownerId = await EventController.getEventOwner(client, eventId);
            if(ownerId === reqId || req.session.authLevel === 'admin') {
                await client.query(`BEGIN`);

                const result = await EventController.getEvent(client, eventId);
                if(doUpdateEvent)
                await EventController.modifyEvent(client, eventId, newData.gameCategoryId, newData.eventDate, newData.eventDescription, newData.nbMaxPlayer);
                if(doUpdateAddress)
                await AddressController.updateAddress(client, result[0].addressid, newData.street, newData.number, newData.city, newData.postCode, newData.country);

                await client.query(`COMMIT`);

                res.sendStatus(204);
            } else {
                res.sendStatus(403);
            }
        } catch (e){
            console.error(e);
            await client.query(`ROLLBACK`);
            res.sendStatus(500)
        }finally {
            client.release();
        }
    } else {
        res.sendStatus(400);
    }
}