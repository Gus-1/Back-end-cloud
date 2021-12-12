const EventController = require('../modele/eventDB');
const pool = require('../modele/database');

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
    const {creatorId, gameCategoryId, eventDate, place, eventDescription, nbMaxPlayer} = req.body;
    const client = await pool.connect();
    try{
        await EventController.insertEvent(client, creatorId, gameCategoryId, eventDate, place, eventDescription, nbMaxPlayer);
        res.sendStatus(201);
    } catch (e){
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
            await EventController.deleteEvent(client, eventId);
            res.sendStatus(204);
        }else{
            res.sendStatus(403);
        }
    } catch (e) {
        console.error(e);
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
        res.json(result);
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
    let doUpdate = false;
    let toUpdate = req.body;
    const eventId = req.params.id;
    const newData = {};
    if (toUpdate.eventDate !== undefined || toUpdate.place !== undefined || toUpdate.eventDescription !== undefined ||
        toUpdate.nbMaxPlayer !== undefined || toUpdate.gameCategoryId !== undefined) {
        doUpdate = true;
    }
    if (doUpdate){
        const client = await pool.connect();
        newData.gameCategoryId = toUpdate.gameCategoryId;
        newData.eventDate = toUpdate.eventDate;
        newData.place = toUpdate.place;
        newData.eventDescription = toUpdate.eventDescription;
        newData.nbMaxPlayer = toUpdate.nbMaxPlayer;
        try{
            const ownerId = await EventController.getEventOwner(client, eventId);
            if(ownerId === reqId || req.session.authLevel === 'admin') {
                await EventController.modifyEvent(client, eventId, newData.eventDate, newData.place,
                    newData.eventDescription, newData.nbMaxPlayer);
                res.sendStatus(204);
            } else {
                res.sendStatus(403);
            }
        } catch (e){
            console.error(e);
            res.sendStatus(500)
        }finally {
            client.release();
        }
    } else {
        res.sendStatus(400);
    }
}