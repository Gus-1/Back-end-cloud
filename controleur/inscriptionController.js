const pool = require('../modele/database');
const InscriptionController = require('../modele/inscriptionDB');


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
    const {userId, eventId} = req.body;
    const client = await pool.connect();
    try{
        await client.query("BEGIN;");
        const isNotFull = await InscriptionController.isNotFull(client, eventId);
        if(isNotFull){
            await InscriptionController.linkUserEvent(client, userId, eventId);
            await client.query("COMMIT");
            res.sendStatus(201);
        } else {
          await client.query("ROLLBACK");
          res.status(404).json({error: "Le nombre de participant a atteint le maximum"})  //todo: changer l'erreur
        }
    } catch (e){
        await client.query("ROLLBACK;");
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
 *      UserRemoved:
 *          description: L'utilisateur a été supprimé de l'évenement
 */
module.exports.deleteUserFromEvent = async(req, res) => {
    const {userId, eventId} = req.body;
    const client = await pool.connect();
    try{
        await InscriptionController.deleteUserFromEvent(client, userId, eventId);
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getEventFromUser = async (req, res) => {
    const {userId} = req.body;
    const client = await pool.connect();
    try {
        const result = await InscriptionController.getEventFromUser(client, userId);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.getAllInscription = async (req, res) => {
    const client = await pool.connect();
    try{
        const result = await InscriptionController.getAllInscription(client);
        res.json(result);
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
            await InscriptionController.updateEventInscription(client, inscriptionId, newData.eventId, newData.userId);
            res.sendStatus(204);
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
        res.json(result);
    } catch(e){
        console.log(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}