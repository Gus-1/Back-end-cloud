//GET METHODS
module.exports.getAllCategory = async(client) => {
    return await client.query(`SELECT * FROM gameCategory`);
}

module.exports.getCategoryById = async(client, categoryId) => {
    return await client.query(`SELECT * FROM gameCategory WHERE gameCategoryId = $1`, [categoryId]);
}

//UPDATE METHODS
module.exports.updateCategory = async(client, gameCategoryId, label, description) => {
    const params = [];
    const querySet = [];
    let query = "UPDATE gameCategory SET ";
    if (description !== undefined) {
        params.push(description);
        querySet.push(` description = $${params.length} `);
    }
    if (label !== undefined){
        params.push(label);
        querySet.push(` label = $${params.length} `);
    }
    query += querySet.join(',');
    query += `WHERE gameCategoryId = ${gameCategoryId}`;
    return client.query(query, params);
}


//DELETE METHODS
module.exports.deleteCategory = async(client, gameCategoryId) => {
    return await client.query(`DELETE FROM gameCategory WHERE gameCategoryId = $1`, [gameCategoryId]);
}

//POST METHODS
module.exports.insertCategory = async(client, label, description) => {
    return await client.query(`INSERT INTO gameCategory(label, description) VALUES ($1, $2)`, [label, description]);
}

module.exports.categoryExist = async (client, categoryId) => {
    const {rows} = await client.query(`SELECT count(gameCategoryId) AS nbr FROM gameCategory WHERE gameCategoryId = $1`, [categoryId]);
    return rows[0].nbr > 0;
}