const pool = require('../modele/database');
const InscriptionController = require('../modele/inscriptionDB');
const EventController = require('../modele/eventDB');
const UserController = require('../modele/userDB');

/**
 * @swagger
 *  components:
 *      responses:
 *          UserLié:
 *              description: Lie un utilisateur à un évènement
 *      requestBodies:
 *          UserLié:
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              userId:
 *                                  type: integer
 *                              eventId:
 *                                  type: integer
 *
 *                          required:
 *                              - userId
 *                              - eventId
 */
module.exports.linkUserEvent = async (req, res) => {
    const eventId = req.body.eventId;
    let userId = req.body.userid
    if (userId === undefined)
        userId = req.session.userid;
    if(isNaN(eventId)){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            if (await UserController.userExist(client, userId) && await EventController.eventExist(client, eventId)) {
                await client.query("BEGIN;");
                const isNotFull = await InscriptionController.isNotFull(client, eventId);
                const inscriptionExist = await InscriptionController.inscriptionExist(client, userId, eventId);
                if (!isNotFull)
                    res.sendStatus(418).json({error: "Le nombre de participants a atteint sa limite"});
                else if (inscriptionExist)
                    res.sendStatus(409).json({error: "L'inscription existe déjà"});
                else {
                    await InscriptionController.linkUserEvent(client, userId, eventId);
                    await client.query("COMMIT;");
                    res.sendStatus(201);
                }
            } else {
                res.sendStatus(404);
            }
        } catch (e){
            await client.query("ROLLBACK;");
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}


module.exports.unlinkUser = async (req, res) => {
    const eventId = req.body.eventId;
    let userId = req.body.userid
    if (userId === undefined)
        userId = req.session.userid;
    if(isNaN(eventId)){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try {
            await client.query("BEGIN;");
            const inscriptionExist = await InscriptionController.inscriptionExist(client, userId, eventId);
            if (!inscriptionExist)
                res.sendStatus(404).json({error: "L'inscription n'existe pas"});
            else {
                await InscriptionController.unlinkUser(client, userId, eventId);
                await client.query("COMMIT;");
                res.sendStatus(201);
            }
        } catch (e) {
            await client.query("ROLLBACK;");
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
 *      UserRemoved:
 *          description: L'utilisateur a été supprimé de l'évenement
 */
//todo : Nous pouvons avoir une error plus précise en indiquant que l'inscription d'existe pas
// todo : Replaced by UnlinkUser

module.exports.deleteUserFromEvent = async(req, res) => {
    const inscriptionId = req.params.id;
    const client = await pool.connect();
    if(isNaN(inscriptionId)){
        res.sendStatus(400);
    } else {
        try {
            if (await InscriptionController.inscriptionExist(client, inscriptionId)){
                await InscriptionController.deleteInscription(client, inscriptionId);
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

module.exports.getEventFromUser = async (req, res) => {
    const {userId} = req.body;
    const client = await pool.connect();
    try {
        const {rows: result} = await InscriptionController.getEventFromUser(client, userId);
        if (result !== undefined){
            res.json(result);
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

module.exports.getAllInscription = async (req, res) => {
    const client = await pool.connect();
    try{
        const {rows: result} = await InscriptionController.getAllInscription(client);
        if (result !== undefined){
            res.json(result);
        } else {
            res.sendStatus(404);
        }
    } catch(e) {
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}


module.exports.updateEventInscription = async(req, res) => {
    const inscriptionId = req.params.id;
    let toUpdate = req.body;
    let doUpdate = false;
    const newData = {};

    if (toUpdate.eventId !== undefined || toUpdate.userId !== undefined)
        doUpdate = true;
    if (doUpdate) {
        const client = await pool.connect();

        newData.eventId = toUpdate.eventId;
        newData.userId = toUpdate.userId;
        try {
            if (await InscriptionController.inscriptionExist(client, inscriptionId)){
                await InscriptionController.updateEventInscription(client, inscriptionId, newData.eventId, newData.userId);
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

module.exports.inscriptionExist = async(req, res) => {
    const {userId, eventId} = req.body;
    const client = await pool.connect();
    try {
        const result = await InscriptionController.inscriptionExist(client, userId, eventId);
        if(result !== undefined)
            res.json(result);
        else
            res.sendStatus(404)
    } catch(e){
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getInscription = async (req, res) => {
    const inscriptionId = req.params.id;
    if(isNaN(inscriptionId)){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try {
            const {rows: result} = await InscriptionController.getInscription(client, inscriptionId);
            if(result !== undefined)
                res.json(result);
            else
                res.sendStatus(404);
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}