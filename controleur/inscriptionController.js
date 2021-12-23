const pool = require('../modele/database');
const InscriptionController = require('../modele/inscriptionDB');
const EventController = require('../modele/eventDB');
const UserController = require('../modele/userDB');


/**
 * @swagger
 * components:
 *   schemas:
 *     Inscription:
 *       type: object
 *       properties:
 *         inscriptionId:
 *           type: integer
 *         eventId:
 *           type: integer
 *         userId:
 *           type: integer
 */


/**
 *@swagger
 *components:
 *  responses:
 *      UserLinkedToEvent:
 *          description: L'utilisateur a été lié à un évènement
 *      LinkUserBadRequest:
 *          description: L'id du l'utilisateur et de l'évènement doivent être définis
 *  requestBodies:
 *      UserToLink:
 *          description : Utilisateur à lier à un évènement
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userId:
 *                              type: integer
 *                          eventId:
 *                              type: integer
 *                      required:
 *                          - eventId
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
                const inscriptionExist = await InscriptionController.inscriptionExistByEventUser(client, userId, eventId);
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

/**
 *@swagger
 *components:
 *  responses:
 *      UserUnlinkedFromEvent:
 *          description: L'utilisateur a été délié de l'évènement
 *      UnlinkUserBadRequest:
 *          description: L'id du l'utilisateur et de l'évènement doivent être définis
 *  requestBodies:
 *      UserToUnlink:
 *          description : Utilisateur à détacher d'un évènement
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userId:
 *                              type: integer
 *                          eventId:
 *                              type: integer
 *                      required:
 *                          - eventId
 */

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
            const inscriptionExist = await InscriptionController.inscriptionExistByEventUser(client, userId, eventId);
            if (!inscriptionExist)
                res.sendStatus(404).json({error: "L'inscription n'existe pas"});
            else {
                await InscriptionController.unlinkUser(client, userId, eventId);
                await client.query("COMMIT;");
                res.sendStatus(204);
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
 *      InscriptionDeleted:
 *          description: L'inscription a été supprimée
 *      DeleteInscriptionBadRequest:
 *          description: L'id de l'inscription doit être définit
 *  requestBodies:
 *      InscriptionToDelete:
 *          description : Inscription à supprimer
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          inscriptionId:
 *                              type: integer
 *                      required:
 *                          - inscriptionId
 *
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
            if (await InscriptionController.inscriptionExistById(client, inscriptionId)){
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



//todo : CHECK S'IL DOIT BIEN ETRE LA
/**
 *@swagger
 *components:
 *  responses:
 *      EventFromUserFound:
 *          description: Renvoie un tableau d'id d'évènement auxquelles l'utilisateur est inscrit
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Inscription'
 *      EventFromUserBadRequest:
 *          description: L'id de l'utilisateur doit être fournis
 */
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

/**
 *@swagger
 *components:
 *  responses:
 *      AllInscriptionFound:
 *          description: Renvoie un tableau contenant toutes les inscriptions présentes
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Inscription'
 */
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

/**
 *@swagger
 *components:
 *  responses:
 *      InscriptionUpdated:
 *          description: L'inscription a été modifiée
 *      UpdateInscriptonBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      InscriptionToUpdate:
 *          description : Inscription à mettre à jour
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          eventId:
 *                              type: integer
 *                          userId:
 *                              type: integer
 *                      required:
 *                          - eventId
 *                          - userId
 */
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
            const inscriptionExist = await InscriptionController.inscriptionExistById(client, inscriptionId);
            if (inscriptionExist){
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
        const result = await InscriptionController.inscriptionExistByEventUser(client, userId, eventId);
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


/**
 *@swagger
 *components:
 *  responses:
 *      GetInscriptionFound:
 *          description: Renvoie une inscription sur base de son id
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Inscription'
 *      GetInscriptionBadRequest:
 *          description: L'id de l'inscription doit être définis
 */

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