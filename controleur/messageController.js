const pool = require('../modele/database');
const MessageController = require('../modele/messageDB');
const EventController = require('../modele/eventDB')


/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *      type: object
 *      properties:
 *         messageId:
 *           type: integer
 *         sendId:
 *            type: integer
 *         eventId:
 *           type: integer
 *         content:
 *           type: string
 *         date:
 *           type: integer
 *           format: date
 */

/**
 *@swagger
 *components:
 *  responses:
 *      MessageAdded:
 *          description: Le message a été ajouté
 *      AddMessageBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      MessageToAdd:
 *          description : Message à ajouter
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          sender:
 *                              type: integer
 *                          receiver:
 *                              type: integer
 *                          content:
 *                              type: string
 *                      required:
 *                          - sender
 *                          - receiver
 *                          - content
 */
module.exports.sendMessage = async (req, res) => {
    const {sender, receiver, content} = req.body;
    if(!sender || !receiver || !content){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            client.query("BEGIN;");
            await MessageController.sendMessage(client, sender, receiver, content);
            res.sendStatus(201);
            client.query("COMMIT;");
        } catch (e) {
            console.error(e);
            client.query("ROLLBACK;");
            res.sendStatus(500)
        } finally {
            client.release();
        }
    }
}

/**
 *@swagger
 *components:
 *  responses:
 *      MessageDeleted:
 *          description: Le message a été supprimé
 *      DeleteMessageBadRequest:
 *          description: L'id du message doit être définit
 */
module.exports.deleteMessage = async (req, res) => {
    const messageId = req.params.id;
    const client = await pool.connect();
    try {
        if( await MessageController.messageExist(client, messageId)){
            await MessageController.deleteMessage(client, messageId);
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


/**
 *@swagger
 *components:
 *  responses:
 *      MessageUpdated:
 *          description: Le message a été modifié
 *      UpdateMessageBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      MessageToUpdate:
 *          description : Message à mettre à jour
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          content:
 *                              type: string
 *                      required:
 *                          - content
 */
module.exports.modifyMessage = async (req, res) => {
    const content = req.body.content;
    const messageId = req.params.id;
    const reqId = req.session.id;
    const client = await pool.connect();
    try {
        if(await MessageController.messageExist(client, messageId)){
            const senderId = await MessageController.getOwnerMessage(client, messageId);
            if (senderId === reqId || req.session.authLevel === "admin") {
                await MessageController.modifyMessage(client, messageId, content);
                res.sendStatus(204);
            } else {
                res.sendStatus(403);
            }
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

/**
 *@swagger
 *components:
 *  responses:
 *      ConversationFound:
 *          description: Renvoie une conversation sur base d'un évènement
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Message'
 *      ConversationRetrievedBadRequest:
 *          description: L'id de l'évènement doit être définis
 */
module.exports.getConversation = async (req, res) => {
    const eventId = req.params.id;
    const client = await pool.connect();
    try{
        if(await EventController.eventExist(client, eventId)){
            const {rows: result} = await MessageController.getConversation(client, eventId);
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
 *      OwnerFound:
 *          description: Renvoie l'id du propriétaire d'un message
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Message'
 *      OwnerRetrievedBadRequest:
 *          description: L'id de l'évènement doit être définis
 */
module.exports.getOwner = async(req, res) => {
    const messageId = req.params.id;
    const client = await pool.connect();
    try {
        if(await MessageController.messageExist(client, messageId)){
            const {rows: result} = await MessageController.getOwnerMessage(client, messageId);
            res.json(result.sendid);
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