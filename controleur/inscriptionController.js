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
    const eventId = req.body.eventId;
    let userId = req.body.userid
    if (userId === undefined)
        userId = req.session.userid;
    const client = await pool.connect();
    try{
        await client.query("BEGIN;");
        const isNotFull = await InscriptionController.isNotFull(client, eventId);
        const inscriptionExist = await InscriptionController.inscriptionExist(client, userId, eventId);
        if (!isNotFull)
            res.sendStatus(418).json({error: "Le nombre de participants à atteint sa limite"});
        else if (inscriptionExist)
            res.sendStatus(418).json({error: "L'inscription existe déjà"});
        else {
            await InscriptionController.linkUserEvent(client, userId, eventId);
            await client.query("COMMIT;");
            res.sendStatus(201);
        }
    } catch (e){
        await client.query("ROLLBACK;");
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
/*    try{
        await client.query("BEGIN;");
        const isNotFull = await InscriptionController.isNotFull(client, eventId);
        const inscriptionExist = await InscriptionController.inscriptionExist(client, userId, eventId);
        if(isNotFull && !inscriptionExist){
            await InscriptionController.linkUserEvent(client, userId, eventId);
            await client.query("COMMIT");
            res.sendStatus(201);
        } else {
          await client.query("ROLLBACK");
          res.status(404).json({error: "Le nombre de participant a atteint le maximum"})
        }
    } catch (e){
        await client.query("ROLLBACK;");
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }*/
}

/**
 *@swagger
 *components:
 *  responses:
 *      UserRemoved:
 *          description: L'utilisateur a été supprimé de l'évenement
 */
//todo : Nous pouvons avoir une error plus précise en indiquant que l'inscription d'existe pas
module.exports.deleteUserFromEvent = async(req, res) => {
    const inscriptionId = req.params.id;
    const client = await pool.connect();
    try{
        await InscriptionController.deleteInscription(client, inscriptionId);
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
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.getInscription = async (req, res) => {
    const inscriptionId = req.params.id;
    const client = await pool.connect();
    try {
        const result = await InscriptionController.getInscription(client, inscriptionId);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}