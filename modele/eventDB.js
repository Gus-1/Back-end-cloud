//GET FUNCTION
module.exports.getAllEvent = async(client) => {return await client.query(`SELECT * FROM event`);}
module.exports.getEvent = async(client, eventId) => {return await client.query(`SELECT * FROM event WHERE eventID = $1`, [eventId]);}
module.exports.getCreator = async(client, eventId) => {
    return await client.query(`SELECT event.creatorId, event.eventId, user.userId FROM event JOIN user ON creatorId = userId 
                                WHERE eventId = $1`, [eventId]);
}
module.exports.getEventOwner = async(client, eventId) => {
    const result = await client.query(`SELECT creatorId, eventId FROM event WHERE eventId = $1`, [eventId]);
    return result.rows[0].creatorid;
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

    return client.query(query, params);
}
module.exports.verifyEvent = async(client, eventId, isVerify = true, adminMessage = null) => {
    return await client.query(`
        UPDATE event SET isVerify = $1, adminMessage = $2
        WHERE eventId = $3`, [isVerify, adminMessage, eventId]);
}
