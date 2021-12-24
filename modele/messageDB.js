//POST METHODS
module.exports.sendMessage = async (client, sender, receiver, content) => {
    return await client.query(`INSERT INTO message(sendId, eventId, content, date) VALUES($1, $2, $3, $4)`,
        [sender, receiver, content, new Date()]
    );
}

//DELETE METHODS
module.exports.deleteMessage = async(client, messageId) => {
    return await client.query(`DELETE FROM message WHERE messageId = $1`, [messageId]);
}
module.exports.deleteMessageWithEvent = async (client, eventid) => {
    return await client.query(`DELETE FROM message WHERE eventId = $1`, [eventid]);
}

//UPDATE METHODS
module.exports.modifyMessage = async(client, messageId, content) => {
    return await client.query(`UPDATE message SET content = $1 WHERE messageId = $2`, [content, messageId]);
}

//GET METHODS
module.exports.getConversation = async(client, eventId) => {
    const result = await client.query(`SELECT * FROM message WHERE eventId = $1 ORDER BY date ASC`, [eventId]);
    return result;
}
module.exports.getOwnerMessage = async(client, messageId) => {
    const result =  await client.query(`SELECT messageId, sendId FROM message WHERE messageId = $1`, [messageId]);
    return result;
}

module.exports.messageExist = async(client, messageId) => {
    const {rows} = await client.query(`SELECT count(messageId) AS nbr FROM message WHERE messageId = $1`, [messageId]);
    return rows[0].nbr > 0;
}