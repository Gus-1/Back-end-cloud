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
    if(creatorId === undefined || gameCategoryId === undefined || eventDate === undefined || eventDescription === undefined ||
     nbMaxPlayer === undefined || street === undefined || number === undefined || city === undefined || postalCode === undefined ||
     country === undefined) {
        res.sendStatus(400);
    } else {
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
}

/**
 *@swagger
 *components:
 *  responses:
 *      EvènementSupprimé:
 *          description: L'évènement a été supprimé
 */
module.exports.deleteEvent = async (req, res) => {
    const reqId = req.session.userid;
    const eventId = req.params.id;
    const client = await pool.connect();
    if(isNaN(reqId) || isNaN(eventId)){
        res.sendStatus(400);
    } else if (!await EventController.eventExist(client, eventId)){
        res.sendStatus(404);
    }
    else {
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
}

module.exports.getEvent = async (req, res) => {
    const eventId = req.params.id;
    const client = await pool.connect();
    if(isNaN(eventId)){
        res.sendStatus(400);
    } else {
        try{
            const {rows: result} = await EventController.getEvent(client, eventId);
            if (result !== undefined){
                let mappingResult = {
                    eventid: result[0].eventid,
                    creationdate : result[0].creationdate,
                    eventdate : result[0].eventdate,
                    eventdescription : result[0].eventdescription,
                    isverified : result[0].isverified,
                    nbmaxplayer : result[0].nbmaxplayer,
                    adminmessage : result[0].adminmessage,
                    user : {
                        userid : result[0].userid,
                        firstname : result[0].firstname,
                        lastname : result[0].name,
                        birthdate : result[0].birthdate,
                        isadmin : result[0].isadmin,
                        email : result[0].email,
                        photopath : result[0].photopath
                    },
                    gamecategory : {
                        gamecategoryid : result[0].gamecategoryid,
                        label : result[0].label,
                        description : result[0].description
                    },
                    address : {
                        addressid : result[0].addressid,
                        street : result[0].street,
                        number : result[0].number,
                        city : result[0].city,
                        postalcode : result[0].postalcode,
                        country : result[0].country
                    }
                }
                res.json(mappingResult);
            } else {
                res.sendStatus(404);
            }
        } catch (e){
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}

module.exports.getAllEvent = async (req, res) => {
    const client = await pool.connect();
    try{
        const {rows: result} = await EventController.getAllEvent(client);
        if (result !== undefined){
                mappingResult = [];
                result.forEach(element => {
                    let mapping = {
                        eventid: element.eventid,
                        creationdate: element.creationdate,
                        eventdate: element.eventdate,
                        eventdescription: element.eventdescription,
                        isverified: element.isverified,
                        nbmaxplayer: element.nbmaxplayer,
                        adminmessage: element.adminmessage,
                        user: {
                            userid: element.userid,
                            firstname: element.firstname,
                            lastname: element.name,
                            birthdate: element.birthdate,
                            isadmin: element.isadmin,
                            email: element.email,
                            photopath: element.photopath
                        },
                        gamecategory: {
                            gamecategoryid: element.gamecategoryid,
                            label: element.label,
                            description: element.description
                        },
                        address: {
                            addressid: element.addressid,
                            street: element.street,
                            number: element.number,
                            city: element.city,
                            postalcode: element.postalcode,
                            country: element.country
                        }
                    }
                    mappingResult.push(mapping);
                });
                res.json(mappingResult);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getAllEventByUser = async(req, res) => {
    const userId = req.params.id;
    const client = await pool.connect();
    try{
        const {rows: result} = await EventController.getAllEventByUser(client, userId);
        if(result !== undefined) {
            mappingResult = [];
            result.forEach(element => {
                let mapping = {
                    eventid: element.eventid,
                    creationdate: element.creationdate,
                    eventdate: element.eventdate,
                    eventdescription: element.eventdescription,
                    isverified: element.isverified,
                    nbmaxplayer: element.nbmaxplayer,
                    adminmessage: element.adminmessage,
                    user: {
                        userid: element.userid,
                        firstname: element.firstname,
                        lastname: element.name,
                        birthdate: element.birthdate,
                        isadmin: element.isadmin,
                        email: element.email,
                        photopath: element.photopath
                    },
                    gamecategory: {
                        gamecategoryid: element.gamecategoryid,
                        label: element.label,
                        description: element.description
                    },
                    address: {
                        addressid: element.addressid,
                        street: element.street,
                        number: element.number,
                        city: element.city,
                        postalcode: element.postalcode,
                        country: element.country
                    }
                }
                mappingResult.push(mapping);
            });
            res.json(mappingResult);
        } else
            res.sendStatus(404);
    } catch (e){
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getAllJoinedEvent = async(req, res) => {
    const userId = req.params.id;
    const client = await pool.connect();
    try{
        const {rows: result} = await EventController.getAllJoinedEvent(client, userId);
        if(result !== undefined) {
            mappingResult = [];
            result.forEach(element => {
                let mapping = {
                    eventid: element.eventid,
                    creationdate: element.creationdate,
                    eventdate: element.eventdate,
                    eventdescription: element.eventdescription,
                    isverified: element.isverified,
                    nbmaxplayer: element.nbmaxplayer,
                    adminmessage: element.adminmessage,
                    user: {
                        userid: element.userid,
                        firstname: element.firstname,
                        lastname: element.name,
                        birthdate: element.birthdate,
                        isadmin: element.isadmin,
                        email: element.email,
                        photopath: element.photopath
                    },
                    gamecategory: {
                        gamecategoryid: element.gamecategoryid,
                        label: element.label,
                        description: element.description
                    },
                    address: {
                        addressid: element.addressid,
                        street: element.street,
                        number: element.number,
                        city: element.city,
                        postalcode: element.postalcode,
                        country: element.country
                    }
                }
                mappingResult.push(mapping);
            });
            res.json(mappingResult);
        } else
            res.sendStatus(404);
    } catch (e){
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getAllPending = async(req, res) => {
    const client = await pool.connect();
    try{
        const {rows: result} = await EventController.getAllPending(client);
        if(result !== undefined) {
            mappingResult = [];
            result.forEach(element => {
                let mapping = {
                    eventid: element.eventid,
                    creationdate: element.creationdate,
                    eventdate: element.eventdate,
                    eventdescription: element.eventdescription,
                    isverified: element.isverified,
                    nbmaxplayer: element.nbmaxplayer,
                    adminmessage: element.adminmessage,
                    user: {
                        userid: element.userid,
                        firstname: element.firstname,
                        lastname: element.name,
                        birthdate: element.birthdate,
                        isadmin: element.isadmin,
                        email: element.email,
                        photopath: element.photopath
                    },
                    gamecategory: {
                        gamecategoryid: element.gamecategoryid,
                        label: element.label,
                        description: element.description
                    },
                    address: {
                        addressid: element.addressid,
                        street: element.street,
                        number: element.number,
                        city: element.city,
                        postalcode: element.postalcode,
                        country: element.country
                    }
                }
                mappingResult.push(mapping);
            });
            res.json(mappingResult);
        }
        else
            res.sendStatus(404);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}


//todo : Pas nécessaire jusqu'ici. Peut-on la supprimer ? La fonction n'a pas été clean
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
            if(!await EventController.eventExist(client, eventId)){
                res.sendStatus(404);
            } else {
                const ownerId = await EventController.getEventOwner(client, eventId);
                if(ownerId === reqId || req.session.authLevel === 'admin') {
                    await client.query(`BEGIN`);

                    const {rows: result} = await EventController.getEvent(client, eventId);
                    if(doUpdateEvent)
                        await EventController.modifyEvent(client, eventId, newData.gameCategoryId, newData.eventDate, newData.eventDescription, newData.nbMaxPlayer);
                    if(doUpdateAddress)
                        await AddressController.updateAddress(client, result[0].addressid, newData.street, newData.number, newData.city, newData.postCode, newData.country);

                    await client.query(`COMMIT`);

                    res.sendStatus(204);
                } else {
                    res.sendStatus(403);
                }
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