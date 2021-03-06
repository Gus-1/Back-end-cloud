const {getHash, compareHash} = require('../utils/utils');

// UPDATE METHODS
module.exports.modifyUser = async (client, userId, firstName, name, birthDate, password, photoPath) => {
    const params = [];
    const querySet = [];
    let query = "UPDATE users SET ";
    if(firstName !== undefined) {
        params.push(firstName);
        querySet.push(` firstName = $${params.length} `);
    }
    if(name !== undefined) {
        params.push(name);
        querySet.push(` name = $${params.length} `);
    }
    if(birthDate !== undefined) {
        params.push(birthDate);
        querySet.push(` birthDate = $${params.length} `);
    }
    if(password !== undefined) {
        params.push(await getHash(password));
        querySet.push(` password = $${params.length} `);
    }
    if(photoPath !== undefined) {
        params.push(photoPath);
        querySet.push(` photoPath = $${params.length} `);
    }
    query += querySet.join(',');
    query += ` WHERE userId = ${userId}`;
    return client.query(query, params);
}
module.exports.grantUser = async (client, userId, isAdmin) => {
    return await client.query(`UPDATE users SET isAdmin = $1 WHERE userId = $2`, [isAdmin, userId]);
}

//INSERT METHODS
module.exports.addUser = async (client, firstName, lastName, birthDate, email, password, photoPath) => {
    const date = new Date(birthDate);
    return await client.query(`
        INSERT INTO users(firstName, name, birthDate, isAdmin, email, password, photoPath) VALUES
        ($1, $2, $3, $4, $5, $6, $7)`, [firstName, lastName, date, false, email, await getHash(password), photoPath]);
}

//DELETE METHODS
module.exports.deleteUser = async(client, userId) => {
    const resultAddressId = await client.query(`select addressId from address join event e on address.addressId = e.place where creatorId = $1;`, [userId]);
    for (const address of resultAddressId.rows) {
        await client.query(`delete from address where addressId = $1`, [address.addressid]);
    }
    await client.query(`delete from users where userId = $1`, [userId]);
}

// GET METHODS
module.exports.getAllUsers = async(client) => {
    return await client.query(`SELECT * FROM users`);
}

module.exports.getUserById = async(client, userId) => {
    const result = await client.query(`SELECT * FROM users WHERE userId = $1`, [userId]);
    return result.rows;
}

async function getUsersByEmail (client, email) {
    return await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
}
module.exports.getUserByEmail = getUsersByEmail;

module.exports.getUser = async(client, email, password) => {
    const {rows: result} = await getUsersByEmail(client, email);
    if (! await compareHash(password, result[0].password))
        throw new Error("Not connected");
    return {
        userType: result.isadmin ? "admin" : "user",
        value: result[0]
    }
};

module.exports.userExist = async (client, idUser) => {
    const {rows} = await client.query(
        "SELECT count(userId) AS nbr FROM users WHERE userId = $1", [idUser]
    );
    return rows[0].nbr > 0;
}