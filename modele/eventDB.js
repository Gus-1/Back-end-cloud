//GET FUNCTION
module.exports.getAllEvent = async(client) => {
    const result = await client.query(`select e.eventId, e.creatorId, e.gameCategoryId, e.creationDate, e.eventDate, a.street, a.number, a.country, a.city,
       a.postalCode,  e.eventDescription, e.isVerified, e.nbMaxPlayer, e.adminMessage from event e join address a on e.place = a.addressId`);
    return result.rows;
}
module.exports.getEvent = async(client, eventId) => {
    const result = await client.query(`select e.eventId, e.creatorId, e.gameCategoryId, e.creationDate, e.eventDate, a.street, a.number, a.country, a.city,
       a.postalCode,  e.eventDescription, e.isVerified, e.nbMaxPlayer, e.adminMessage from event e join address a on e.place = a.addressId WHERE eventID = $1`, [eventId]);
    return result.rows;
}
module.exports.getCreator = async(client, eventId) => {
    const result = await client.query(`SELECT event.creatorId, event.eventId, user.userId FROM event JOIN user ON creatorId = userId 
                                WHERE eventId = $1`, [eventId]);
    return result.rows;
}
module.exports.getEventOwner = async(client, eventId) => {
    const result = await client.query(`SELECT creatorId, eventId FROM event WHERE eventId = $1`, [eventId]);
    return result.rows[0].creatorid;
}
module.exports.getAllEventByUser = async(client, userId) => {
    const result = await client.query(`select * from event where creatorId = $1`, [userId]);
    return result.rows;
}
module.exports.getAllJoinedEvent = async(client, userId) =>{
    const result = await client.query(`select * from event join inscription i on event.eventid = i.eventid join users u on i.userid = u.userid where u.userid = $1`, [userId]);
    return result.rows;
}


//POST FUNCTION
module.exports.insertEvent = async (client, userId, gameCategoryId, date, place, eventDescription, nbMaxPlayer) => {
    const eventDate = new Date(date);
    return await client.query(`
        INSERT INTO event(creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, 
                          nbMaxPlayer) VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)`, [userId, gameCategoryId, new Date(), eventDate, place, eventDescription, 0, nbMaxPlayer]
    );
}

//DELETE FUNCTION
module.exports.deleteEvent = async(client, eventId) => {
    await client.query(`DELETE FROM address WHERE addressid in (SELECT place from event where eventid = $1)`, [eventId])
    await client.query(`DELETE FROM message WHERE eventid = $1`, [eventId]);
    await client.query(`DELETE FROM inscription WHERE eventId = $1`, [eventId]);
    return await client.query(`
        DELETE FROM event WHERE eventId = $1`, [eventId]);
}


//UPDATE FUNCTION
module.exports.modifyEvent = async (client, gameCategoryId, eventDate, place, eventDescription, nbMaxPlayer) => {
    const params = [];
    const querySet = [];
    let query = "UPDATE event SET ";
    if(gameCategoryId !== undefined) {
        params.push(gameCategoryId);
        querySet.push(` gameCategoryId = $${params.length} `);
    }
    if(eventDate !== undefined) {
        params.push(eventDate);
        querySet.push(` eventDate = $${params.length} `);
    }
    if(place !== undefined) {
        params.push(place);
        querySet.push(` place = $${params.length} `);
    }
    if(eventDescription !== undefined) {
        params.push(eventDescription);
        querySet.push(` eventDescription = $${params.length} `);
    }
    if(nbMaxPlayer !== undefined) {
        params.push(nbMaxPlayer);
        querySet.push(` nbMaxPlayer = $${params.length} `);
    }

    query += querySet.join(',');

    return await client.query(query, params);
}
module.exports.verifyEvent = async(client, eventId, isVerify = true, adminMessage = null) => {
    return await client.query(`
        UPDATE event SET isVerify = $1, adminMessage = $2
        WHERE eventId = $3`, [isVerify, adminMessage, eventId]);
}
