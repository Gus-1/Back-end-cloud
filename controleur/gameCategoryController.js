const GameCategoryDB = require ('../modele/gameCategoryDB');
const pool = require('../modele/database');


/**
 * @swagger
 *  components:
 *      responses:
 *          EvenementInseré:
 *              description: L'évenement a été ajouté à la base de donnée
 *      requestBodies:
 *          EvenementInseré:
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              label:
 *                                  type: string
 *                              description:
 *                                  type: string
 *
 *                          required:
 *                              - label
 *                              - descritpion
 */
module.exports.insertCategory = async (req, res) => {
    const {label, description} = req.body;
    const client = await pool.connect();
    try{
        await GameCategoryDB.insertCategory(client, label, description);
        res.sendStatus(201);
    } catch (e){
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

/**
 *@swagger
 *components:
 *  responses:
 *      CategoryDeleted:
 *          description: La catégorie a été supprimée
 */
module.exports.deleteCategory = async (req, res) => {
    const gameCategoryId = req.params.id;
    const client = await pool.connect();
    try{
        await GameCategoryDB.deleteCategory(client, gameCategoryId);
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getAllCategory = async(req, res) => {
    const client = await pool.connect();
    try{
        const result = await GameCategoryDB.getAllCategory(client);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

module.exports.updateCategory = async (req, res) => {
    let doUpdate = false;
    let toUpdate = req.body;
    const gameCategoryId = req.params.id;
    const newData = {};
    if(toUpdate.label !== undefined || toUpdate.description !== undefined) {
        doUpdate = true;
    }
    if (doUpdate){
        const client = await pool.connect();
        newData.label = toUpdate.label
        newData.description = toUpdate.description;
        try{
            await GameCategoryDB.updateCategory(client, gameCategoryId, newData.label, newData.description);
            res.sendStatus(204);
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    } else{
        res.sendStatus(400);
    }
}