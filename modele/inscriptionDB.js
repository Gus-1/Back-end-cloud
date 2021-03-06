module.exports.linkUserEvent = async(client, userId, eventId) => {
    return await client.query(`INSERT INTO inscription(userId, eventId) values ($1, $2)`, [userId, eventId]);
}

module.exports.deleteAllFromEvent = async(client, eventId) => {
    return await client.query(`DELETE FROM inscription WHERE eventId = $1`, [eventId]);
}
module.exports.deleteInscription = async (client, inscriptionId) => {
    return await client.query(`DELETE FROM inscription WHERE inscriptionId = $1`, [inscriptionId]);
}

module.exports.getEventFromUser = async(client, userId) => {
    return await client.query(`SELECT eventId FROM inscription WHERE userId = $1`, [userId]);
}

module.exports.getAllInscription = async(client) => {
    return await client.query(`select i.*, u.firstName, u.name, e.eventDescription
        from inscription i join users u on i.userid = u.userid join event e on i.eventId = e.eventId`);
}

module.exports.updateEventInscription = async(client, inscriptionId, eventId, userId) => {
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
    query += `WHERE inscriptionId = ${inscriptionId}`;

    return await client.query(query, params);
}

module.exports.isNotFull = async(client, eventId) => {
    const resultQuantity = await client.query(`select count(*) from (select event.*, i.* from event join inscription i on event.eventid = i.eventid where (event.eventId = $1)) as result;`, [eventId]);
    const resultMax = await client.query(`select nbmaxplayer from event where eventid = $1`, [eventId]);

    return (resultQuantity.rows[0].count < resultMax.rows[0].nbmaxplayer);
}

module.exports.inscriptionExistByEventUser = async(client, userId, eventId) => {
    const {rows} = await client.query(`SELECT count(inscriptionId) AS nbr FROM inscription WHERE userid = $1 and eventid = $2`, [userId, eventId]);
    return rows[0].nbr > 0;
}

module.exports.inscriptionExistById = async(client, inscriptionId) => {
    const {rows} = await client.query(`SELECT count(inscriptionId) AS nbr FROM inscription WHERE inscriptionId = $1`, [inscriptionId]);
    return rows[0].nbr > 0;
}

module.exports.getInscription = async (client, inscriptionId) => {
    return await client.query(`SELECT * from inscription where (inscriptionid = $1)`, [inscriptionId]);
}

module.exports.unlinkUser = async(client, userId, eventId) => {
    return await client.query(`DELETE FROM inscription WHERE userId = $1 and eventId = $2`, [userId, eventId]);
}
