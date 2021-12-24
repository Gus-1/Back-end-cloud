//GET FUNCTION
module.exports.getAllEvent = async(client) => {
    return await client.query(`select e.eventid, e.creationdate, e.eventdate, e.eventdescription, e.isverified, e.nbmaxplayer, e.adminmessage,
                                              u.userid, u.firstname, u.name, u.birthdate, u.isadmin, u.email, u.photopath,
                                              g.gamecategoryid, g.label, g.description,
                                              a.addressid, a.street, a.number, a.city, a.postalcode, a.country
                                       FROM event e
                                                join users u on e.creatorid = u.userid
                                                join gamecategory g on e.gamecategoryid = g.gamecategoryid
                                                join address a on e.place = a.addressid `);
}

module.exports.getEvent = async(client, eventId) => {
    return await client.query(`select e.eventid, e.creationdate, e.eventdate, e.eventdescription, e.isverified, e.nbmaxplayer, e.adminmessage,
                                              u.userid, u.firstname, u.name, u.birthdate, u.isadmin, u.email, u.photopath,
                                              g.gamecategoryid, g.label, g.description,
                                              a.addressid, a.street, a.number, a.city, a.postalcode, a.country
                                       FROM event e
                                                join users u on e.creatorid = u.userid
                                                join gamecategory g on e.gamecategoryid = g.gamecategoryid
                                                join address a on e.place = a.addressid
                                       WHERE eventid = $1
    `, [eventId]);
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
    return await client.query(`select e.eventid, e.creationdate, e.eventdate, e.eventdescription, e.isverified, e.nbmaxplayer, e.adminmessage,
                                              u.userid, u.firstname, u.name, u.birthdate, u.isadmin, u.email, u.photopath,
                                              g.gamecategoryid, g.label, g.description,
                                              a.addressid, a.street, a.number, a.city, a.postalcode, a.country
                                       FROM event e
                                                join users u on e.creatorid = u.userid
                                                join gamecategory g on e.gamecategoryid = g.gamecategoryid
                                                join address a on e.place = a.addressid
                                       WHERE u.userId = $1`, [userId]);
}
module.exports.getAllJoinedEvent = async(client, userId) =>{
    return await client.query(`select e.eventid, e.creationdate, e.eventdate, e.eventdescription, e.isverified, e.nbmaxplayer, e.adminmessage,
                                              u.userid, u.firstname, u.name, u.birthdate, u.isadmin, u.email, u.photopath,
                                              g.gamecategoryid, g.label, g.description,
                                              a.addressid, a.street, a.number, a.city, a.postalcode, a.country
                                        FROM event e
                                                join inscription i on e.eventid = i.eventid
                                                join address a on e.place = a.addressid
                                                join users u on e.creatorid = u.userid
                                                join gamecategory g on e.gamecategoryid = g.gamecategoryid
                                        WHERE i.userid = $1`, [userId]);
}

module.exports.getAllPending = async(client) => {
    return await client.query(`select e.eventid, e.creationdate, e.eventdate, e.eventdescription, e.isverified, e.nbmaxplayer, e.adminmessage,
                                              u.userid, u.firstname, u.name, u.birthdate, u.isadmin, u.email, u.photopath,
                                              g.gamecategoryid, g.label, g.description,
                                              a.addressid, a.street, a.number, a.city, a.postalcode, a.country
                                       FROM event e
                                                join users u on e.creatorid = u.userid
                                                join gamecategory g on e.gamecategoryid = g.gamecategoryid
                                                join address a on e.place = a.addressid
                                       WHERE isverified = false`);
}


//POST FUNCTION
module.exports.insertEvent = async (client, userId, gameCategoryId, date, place, eventDescription, nbMaxPlayer) => {
    const eventDate = new Date(date);
    return await client.query(`
        INSERT INTO event(creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, 
                          nbMaxPlayer) VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)`, [userId, gameCategoryId, new Date(), eventDate, place, eventDescription, false, nbMaxPlayer]
    );
}

//DELETE FUNCTION
module.exports.deleteEvent = async(client, eventId) => {
    return await client.query(`DELETE FROM event WHERE eventId = $1`, [eventId]);
}
module.exports.deleteUsersEvent = async(client, userId) => {
    await client.query(`DELETE FROM event WHERE creatorid = $1`, [userId]);
}


//UPDATE FUNCTION
module.exports.modifyEvent = async (client, eventId, gameCategoryId, eventDate, eventDescription, nbMaxPlayer) => {
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
    if(eventDescription !== undefined) {
        params.push(eventDescription);
        querySet.push(` eventDescription = $${params.length} `);
    }
    if(nbMaxPlayer !== undefined) {
        params.push(nbMaxPlayer);
        querySet.push(` nbMaxPlayer = $${params.length} `);
    }
    query += querySet.join(',');
    query += `WHERE eventid = ${eventId}`;

    return await client.query(query, params);
}

module.exports.verifyEvent = async(client, eventId, isVerify, adminMessage) => {
    const params = [];
    const querySet = [];
    let query = "UPDATE event SET ";
    if(isVerify !== undefined) {
        params.push(isVerify);
        querySet.push(` isVerified = $${params.length} `);
    }
    if(adminMessage !== undefined) {
        params.push(adminMessage);
        querySet.push(` adminMessage = $${params.length} `);
    }
    query += querySet.join(',');
    query += `WHERE eventid = ${eventId}`;

    return await client.query(query, params);
}

module.exports.eventExist = async(client, idEvent) => {
    const {rows} = await client.query(`SELECT count(eventId) AS nbr FROM event WHERE eventId = $1`, [idEvent]);
    return rows[0].nbr >0;
}