const GameCategoryDB = require ('../modele/gameCategoryDB');
const pool = require('../modele/database');


/**
 * @swagger
 * components:
 *   schemas:
 *     GameCategory:
 *       type: object
 *       properties:
 *         gameCategoryId:
 *           type: integer
 *         label:
 *           type: string
 *         description:
 *           type: string
 */

/**
 *@swagger
 *components:
 *  responses:
 *      GameCategoryAdded:
 *          description: La catégorie a été ajoutée
 *      AddGameCategoryBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      GameCategoryToAdd:
 *          description : La catégorie à ajouter
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          label:
 *                              type: string
 *                          description:
 *                              type: string
 *                      required:
 *                          - label
 *                          - description
 */

module.exports.insertCategory = async (req, res) => {
    const {label, description} = req.body;
    if(label === undefined || description === undefined){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            await client.query(`BEGIN`);
            await GameCategoryDB.insertCategory(client, label, description);
            await client.query(`COMMIT`);
            res.sendStatus(201);
        } catch (e){
            console.error(e);
            await client.query(`ROLLBACK`);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}


/**
 *@swagger
 *components:
 *  responses:
 *      GameCategoryDeleted:
 *          description: La catégorie a été supprimée ainsi que tous les évènements liés
 *      DeleteGameCategoryBadRequest:
 *          description: L'id de la catégorie doit être définit
 *  requestBodies:
 *      GameCategoryToDelete:
 *          description : Catégorie à supprimer
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          gameCategoryId:
 *                              type: integer
 *                      required:
 *                          - gameCategoryId
 */
//content deleted

// La suppression d'une catégorie supprime aussi les évènements lié.
// Justification : Si une catégorie pose problème, nous supprimons donc tous les évènements qui y sont liés
module.exports.deleteCategory = async (req, res) => {
    const gameCategoryId = req.params.id;
    if(isNaN(gameCategoryId)){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            if(!await GameCategoryDB.categoryExist(client, gameCategoryId)){
                res.sendStatus(404);
            } else {
                await GameCategoryDB.deleteCategory(client, gameCategoryId);
                res.sendStatus(204);
            }
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}


/**
 *@swagger
 *components:
 *  responses:
 *      AllCategoryFound:
 *          description: Renvoie un tableau contenant toutes les catégories
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GameCategory'
 */
//J'ai retiré la bad request
module.exports.getAllCategory = async(req, res) => {
    const client = await pool.connect();
    try{
        const {rows: result} = await GameCategoryDB.getAllCategory(client);
        if(result !== undefined) {
            res.json(result);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
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
 *      CategoryByIdFound:
 *          description: Renvoie une catégorie sur base de l'identifiant
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GameCategory'
 *      CategoryByIdBadRequest:
 *          description: L'identifiant de la catégorie doit être définis
 */

module.exports.getCategoryById = async (req, res) => {
    const id = req.params.id;
    const client = await pool.connect();
    if(isNaN(id)){
        res.sendStatus(400);
    } else {
        try {
            if(!await GameCategoryDB.categoryExist(client, id)){
                res.sendStatus(404);
            }else {
                const {rows: result} = await GameCategoryDB.getCategoryById(client, id);
                res.json(result);
            }
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}


/**
 *@swagger
 *components:
 *  responses:
 *      GameCategoryUpdated:
 *          description: La catégorie a été modifiée
 *      GameCategoryBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      GameCategoryToUpdate:
 *          description : La catégorie à mettre à jour
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          label:
 *                              type: string
 *                          description:
 *                              type: string
 *                      required:
 *                          - label
 *                          - description
 */

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
            if(! await GameCategoryDB.categoryExist(client, gameCategoryId)){
                res.sendStatus(404);
            } else {
                await GameCategoryDB.updateCategory(client, gameCategoryId, newData.label, newData.description);
                res.sendStatus(204);
            }
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