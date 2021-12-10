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
    const result = await client.query(`SELECT * FROM users`);
    return result.rows;
}
module.exports.getUserById = async(client, userId) => {
    const result = await client.query(`SELECT * FROM users WHERE userId = $1`, [userId]);
    return result.rows;
}
async function getUsersByEmail (client, email) {
    const result = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
}
module.exports.getUserByEmail = getUsersByEmail;

module.exports.getUser = async(client, email, password) => {
    const user = await getUsersByEmail(client, email);
    if (! await compareHash(password, user.password))
        throw new Error("Not connected");
    return {

        userType: user.isadmin ? "admin" : "user",
        value: user
    }
};

module.exports.userExist = async (client, idUser) => {
    const {rows} = await client.query(
        "SELECT count(id) AS nbr FROM users WHERE userId = $1", [idUser]
    );
    return rows[0].nbr > 0;
}