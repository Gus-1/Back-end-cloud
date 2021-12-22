//GET FUNCTION
const {rows} = require("pg/lib/defaults");

module.exports.getAddress = async(client, addressId) => {
    const result = await client.query(`SELECT * FROM address WHERE addressId = $1`, [addressId]);
    return result;
}

module.exports.getAllAddress = async(client) =>{
    const result = await client.query(`SELECT * FROM address`);
    return result;
}

//POST FUNCTION
module.exports.insertAddress = async (client, street, number, city, postCode, country) => {
    await client.query(`INSERT INTO address (street, number, city, postalCode, country) VALUES 
                                ($1, $2, $3, $4, $5)`, [street, number, city, postCode, country]);

    return ((await client.query(`SELECT addressid, LAST_VALUE (addressid) OVER(ORDER BY addressid DESC) addressid FROM address`)).rows[0].addressid);
}

//PATCH FUNCTION
module.exports.updateAddress = async (client, addressId, street, number, city, postCode, country) => {
    const params = [];
    const querySet = [];
    let query = "UPDATE address SET ";
    if(street !== undefined) {
        params.push(street);
        querySet.push(` street = $${params.length} `);
    }
    if(number !== undefined){
        params.push(number);
        querySet.push(` number = $${params.length}`);
    }
    if(city !== undefined){
        params.push(city);
        querySet.push(` city = $${params.length}`);
    }
    if(postCode !== undefined){
        params.push(postCode);
        querySet.push(` postalCode = $${params.length}`);
    }
    if(country !== undefined) {
        params.push(country);
        querySet.push(` country = $${params.length}`);
    }

    query += querySet.join(',');
    query += ` WHERE addressId = ${addressId}`;

    return await client.query(query, params);
}

//DELETE FUNCTION
module.exports.deleteAddress = async (client, addressId) => {
    return await client.query(`DELETE FROM address WHERE addressId = $1`, [addressId]);
}
module.exports.deleteAddressWithEvent = async (client, eventId) => {
    return await client.query(`DELETE FROM address WHERE addressid in 
    (SELECT place from event join inscription i on event.eventid = i.eventid WHERE event.eventid = $1)`, [eventId]);
}