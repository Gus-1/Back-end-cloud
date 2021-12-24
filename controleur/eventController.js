const EventController = require('../modele/eventDB');
const AddressController = require('../modele/addressDB');
const MessageController = require('../modele/messageDB');
const InscriptionController = require('../modele/inscriptionDB');
const pool = require('../modele/database');


/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         eventId:
 *           type: integer
 *         creatorId:
 *           type: integer
 *         gameCategoryId:
 *           type: integer
 *         creationDate:
 *           type: string
 *           format: date
 *         eventDate:
 *           type: string
 *           format: date
 *         place:
 *           type: integer
 *         eventDescription:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         nbMaxPlayer:
 *           type: integer
 *         adminMessage:
 *           type: string
 */



/**
 *@swagger
 *components:
 *  responses:
 *      EventAdded:
 *          description: L'évènement a été ajouté
 *      AddEventBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      EventToAdd:
 *          description : Evenement a ajouter
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          creatorid:
 *                              type: integer
 *                          gamecategory:
 *                              type: object
 *                              properties:
 *                                gamecategoryid:
 *                                  type: integer
 *                                label:
 *                                  type: string
 *                                description:
 *                                  type: string
 *                          eventdate:
 *                              type: string
 *                              format: date
 *                          address:
 *                              type: object
 *                              properties:
 *                                street:
 *                                  type: string
 *                                number:
 *                                  type: integer
 *                                country:
 *                                  type: string
 *                                city:
 *                                  type: string
 *                                postalCode:
 *                                  type: integer
 *                          eventDescription:
 *                             type: string
 *                          nbMaxPlayer:
 *                              type: integer
 *                      required:
 *                          - gamecategoryid
 *                          - creationDate
 *                          - eventDate
 *                          - street
 *                          - number
 *                          - country
 *                          - city
 *                          - postalcode
 *                          - eventDescription
 *                          - nbMaxPlayer
 */

module.exports.insertEvent = async (req, res) => {
    const {gamecategory, eventdate, eventdescription, nbmaxplayer, address} = req.body;
    const creatorId = req.body.creatorid ?? req.session.userid;

    if(!gamecategory || !gamecategory.gamecategoryid || !eventdate || !eventdescription || !nbmaxplayer || !address || !address.street || !address.number || !address.city
        || !address.postalcode || !address.country) {
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            await client.query("BEGIN");
            const addressId = await AddressController.insertAddress(client, address.street, address.number, address.city, address.postalcode, address.country);
            await EventController.insertEvent(client, creatorId, gamecategory.gamecategoryid, eventdate, addressId, eventdescription, nbmaxplayer);
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
 *      EventDeleted:
 *          description: L'évènement a été supprimé
 *      DeleteEventBadRequest:
 *          description: L'id de l'évènement doit être fourni
 *  requestBodies:
 *      EventToDelete:
 *          description : Evenement à supprimer
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          eventId:
 *                              type: integer
 *                      required:
 *                          - eventId
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



/**
 *@swagger
 *components:
 *  responses:
 *      GetEventFound:
 *          description: Renvoie un évènement sur base d'un identifiant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 *      GetEventBadRequest:
 *          description: L'id doit être fournie
 */

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


/**
 *@swagger
 *components:
 *  responses:
 *      AllEventFound:
 *          description: Renvoie un tableau de tous les évènements
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 */
//J'ai supprimé la bad request
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


/**
 *@swagger
 *components:
 *  responses:
 *      AllEventByUserFound:
 *          description: Renvoie un tableau de tous les évènements
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 *      AllEventByUserBadRequest:
 *          description: L'id de l'utilisateur doit être définis
 */

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


/**
 *@swagger
 *components:
 *  responses:
 *      AllJoinedEventFound:
 *          description: Renvoie un tableau de tous les évènements rejoints
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 *      AllJoinedEventBadRequest:
 *          description: L'id de l'utilisateur doit être fournis
 */

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


/**
 *@swagger
 *components:
 *  responses:
 *      AllPendingEventFound:
 *          description: Renvoie un tableau de tous les évènements en attente de validation
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 */
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


/**
 *@swagger
 *components:
 *  responses:
 *      EventOwnerFound:
 *          description: Renvoie l'id du propriétaire d'un évènement
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 *      EventOwnerBadRequest:
 *          description: L'id de l'évènement doit être fournis
 */

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
 *@swagger
 *components:
 *  responses:
 *      EventUpdated:
 *          description: L'évènement a été modifié
 *      UpdateEventBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      EventToUpdate:
 *          description : L'évènement à mettre à jour
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          eventDate:
 *                              type: string
 *                              format: date
 *                          place:
 *                              type: integer
 *                          eventDescription:
 *                              type: string
 *                          nbMaxPlayer:
 *                              type: integer
 *                          gameCategoryId:
 *                              type: integer
 *                          street:
 *                              type: string
 *                          number:
 *                              type: string
 *                          country:
 *                              type: string
 *                          city:
 *                              type: string
 *                          postCode:
 *                              type: string
 *                      required:
 *                          - eventDate
 *                          - place
 *                          - eventDescription
 *                          - nbMaxPlayer
 *                          - gameCategoryId
 *                          - street
 *                          - number
 *                          - country
 *                          - city
 *                          - postCode
 */

module.exports.modifyEvent = async(req, res) => {
    const reqId = req.session.id
    let doUpdateEvent = false;
    let doUpdateAddress = false;
    let toUpdate = req.body;
    const eventId = req.params.id;
    const newData = {};

    if (toUpdate.eventDate !== undefined || toUpdate.eventDescription !== undefined ||
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



/**
 *@swagger
 *components:
 *  responses:
 *      EventVerified:
 *          description: L'évènement a été vérifié
 *      VerifyEventBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      EventToVerify:
 *          description : L'évènement à vérifier
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          adminMessage:
 *                              type: string
 *                          isVerified:
 *                              type: boolean
 *                      required:
 *                          - adminMessage
 *                          - isVerified
 */

module.exports.checkEvent = async(req, res) => {
    //Pouvoir ajouter admin note et check verified
    let doUpdate = false;
    let toUpdate = req.body;
    const idToUpdate = req.params.id;
    const newData = {};

    if(toUpdate.adminMessage !== undefined || toUpdate.isVerified !== undefined){
        doUpdate = true;
    }
    if(doUpdate){
        const client = await pool.connect();
        newData.adminMessage = toUpdate.adminMessage;
        newData.isVerified = toUpdate.isVerified;

        try{
            if (await EventController.eventExist(client, idToUpdate)){
                await EventController.verifyEvent(client, idToUpdate, newData.isVerified, newData.adminMessage);
                res.sendStatus(204);
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
}