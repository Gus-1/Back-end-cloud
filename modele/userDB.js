const {getHash, compareHash} = require('../utils/utils');
const {getUserByEmail} = require("./userDB");

// UPDATE METHODS
module.exports.modifyUser = async (client, userId, firstName, name, birthDate, password, photoPath) => {
    const params = [];
    const querySet = [];
    let query = "UPDATE users SET ";
    if(firstName !== undefined) {d
        params.push(firstName);
        querySet.push(` firstName = $${params.length} `);
    }
    if(name !== undefined) {
        params.push(name);
        querySet.push(` name = $${params.length} `);
    }
    if(birthDate !== undefined) {
        params.push(birthDate.toISOString());
        querySet.push(` birthDate = $${params.length} `);
    }
    if(password !== undefined) {
        params.push(getHash(password));
        querySet.push(` password = $${params.length} `);
    }
    if(photoPath !== undefined) {
        params.push(photoPath);
        querySet.push(` photoPath = $${params.length} `);
    }
    query += querySet.join(',');
    return client.query(query, params);
}

//INSERT METHODS
module.exports.addAdmin = async (client, firstName, lastName, birthDate, email, password, photoPath) => {
    const date = new Date(birthDate);
    return await client.query(`
        INSERT INTO users(firstName, name, birthDate, isAdmin, email, password, photoPath) VALUES
        ($1, $2, $3, $4, $5, $6, $7)`, [firstName, lastName, date, 1, email, await getHash(password), photoPath]);
}
module.exports.addUser = async (client, firstName, lastName, birthDate, email, password, photoPath) => {
    const date = new Date(birthDate);
    return await client.query(`
        INSERT INTO users(firstName, name, birthDate, isAdmin, email, password, photoPath) VALUES
        ($1, $2, $3, $4, $5, $6, $7)`, [firstName, lastName, date, 0, email, await getHash(password), photoPath]);
}

//DELETE METHODS
module.exports.deleteUser = async(client, userId) => {
    return await client.query(`DELETE FROM users WHERE userId = $1`, [userId]);
}

// GET METHODS
module.exports.getAllUsers = async(client) => {
    return await client.query(`SELECT * FROM users`);
}
module.exports.getUserById = async(client, userId) => {
    return await client.query(`SELECT * FROM users WHERE userId = $1`, [userId]);
}
async function getUsersByEmail (client, email) {
    return await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
}
module.exports.getUserByEmail = getUsersByEmail;

module.exports.getUser = async(client, email, password) => {
    const user = await getUsersByEmail(client, email);
    const userRow = user.rows[0];
    if (! await compareHash(password, userRow.password))
        throw new Error("Not connected");
    return {

        userType: userRow.isadmin ? "admin" : "user",
        value: userRow
    }
};
