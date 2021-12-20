const pool = require('../modele/database');
const MessageController = require('../modele/messageDB');


module.exports.sendMessage = async (req, res) => {
    const {sender, receiver, content} = req.body;
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

/**
 *@swagger
 *components:
 *  responses:
 *      MessageDeleted:
 *          description: Le message a été supprimé
 */
module.exports.deleteMessage = async (req, res) => {
    const messageId = req.params.id;
    const client = await pool.connect();
    try {
        await MessageController.deleteMessage(client, messageId);
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}


module.exports.modifyMessage = async (req, res) => {
    const content = req.body;
    const messageId = req.params.id;
    const reqId = req.session.id;
    const client = await pool.connect();
    try {
        const senderId = await MessageController.getOwnerMessage(client, messageId);
        if (senderId === reqId) {
            await MessageController.modifyMessage(client, messageId, content);
            res.sendStatus(204);
        } else {
            res.sendStatus(403);
        }
    } catch (e){
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.getConversation = async (req, res) => {
    const eventId = req.params.id;
    const client = await pool.connect();
    try{
        const conversation = await MessageController.getConversation(client, eventId);
        res.json(conversation);
    } catch (e) {
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.getOwner = async(req, res) => {
    const messageId = req.params.id;
    const client = await pool.connect();
    try {
        const owner = await MessageController.getOwnerMessage(client, messageId);
        res.json(owner);
    } catch (e) {
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}