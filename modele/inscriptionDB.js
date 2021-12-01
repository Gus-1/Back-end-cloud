module.exports.linkUserEvent = async(client, userId, eventId) => {
    return await client.query(`INSERT INTO inscription(userId, eventId) values ($1, $2)`, [userId, eventId]);
}

module.exports.deleteUserFromEvent = async(client, userId, eventId) => {
    return await client.query(`DELETE FROM inscription WHERE eventId = $1 and userId= $2`, [eventId, userId]);
}

module.exports.getEventFromUser = async(client, userId) => {
    return await client.query(`SELECT eventId FROM inscription WHERE userId = $1`, [userId]);
}

module.exports.updateEventInscription = async(client, eventId, userId) => {
    const params = [];
    const querySet = [];
    let query = "UPDATE inscription SET ";
    if (eventId !== undefined){
        params.push(eventId);
        querySet.push(` eventId = $${params.length} `);
    }
    if(userId !== undefined){
        params.push(userId);
        querySet.push(` userId = $${params.length} `);
    }

    query += querySet.join(',');

    return await client.query(query, params);
}