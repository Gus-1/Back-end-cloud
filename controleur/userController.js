const UserController = require('../modele/userDB');
const EventController = require('../modele/eventDB');
const pool = require('../modele/database');
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          properties:
 *              userid:
 *                  type: integer
 *              firstname:
 *                  type: string
 *                  description: prenom de l'utilisateur
 *              name:
 *                  type: string
 *                  description: nom de l'utilisateur
 *              birthdate:
 *                  type: date
 *                  description: date de naissance de l'utilisateur (YYYY-MM-DD)
 *              isadmin:
 *                  type: string
 *                  description: est à 1 si l'utilisateur est un admin
 *              email:
 *                  type: string
 *                  description: adresse email de l'utilisateur
 *              password:
 *                  type: string
 *                  format: password
 *              photopath:
 *                  type: string
 *                  description: chemin d'accès à sa photo
 */

/**
 * @swagger
 * components:
 *  schemas:
 *      Login:
 *          type: object
 *          properties:
 *              email:
 *                  type: string
 *              password:
 *                  type: string
 *                  format: password
 *          required:
 *              - email
 *              - password
 */
module.exports.login = async (req, res) => {
    const {email, password} = req.body;
    if (email === undefined || password === undefined) {
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            const result = await UserController.getUser(client, email, password);
            const {userType, value} = result;
            const {userid, firstname, name, birthdate, photopath} = value;
            const payload = {status : userType, value: {userid, firstname, name, birthdate, email, photopath}}
            const token = jwt.sign(
                payload,
                process.env.SECRET_TOKEN,
                {expiresIn: '1d'}
            );
            res.json(token);
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
 *      UtilisateurAjoute:
 *          description: l'utilisateur a été ajouté
 *  requestBodies:
 *      UtilisateurAAjoute:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstname:
 *                              type: string
 *                              description: prenom de l'utilisateur
 *                          lastname:
 *                              type: string
 *                              description: nom de l'utilisateur
 *                          birthdate:
 *                              type: date
 *                              description: date de naissance de l'utilisateur (YYYY-MM-DD)
 *                          email:
 *                              type: string
 *                              description: adresse email de l'utilisateur
 *                          password:
 *                              type: string
 *                              format: password
 *                          photopath:
 *                              type: string
 *                              description: chemin d'accès à sa photo
 */
module.exports.addUser = async (req, res) => {
    const {firstName, lastName, birthDate, email, password, photoPath} = req.body;
    const client = await pool.connect();
    try{
        //Eviter le saut d'id grace à la transaction (cas ou email deja utilisée par exemple)
        await client.query("BEGIN");
        await UserController.addUser(client, firstName, lastName, birthDate, email, password, photoPath);
        await client.query("COMMIT");
        res.sendStatus(201);
    } catch (e){
        await client.query("ROLLBACK");
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
 *      UserDeleted:
 *          description: L'utilisateur a été supprimé
 */
module.exports.deleteUser = async(req, res) => {
    const id = req.params.id;
    const client = await pool.connect();
    try{
        await client.query("BEGIN");
        await EventController.deleteUsersEvent(client, id);
        await UserController.deleteUser(client, id);
        await client.query("COMMIT");
        res.sendStatus(204);
    } catch (e){
        await client.query("ROLLBACK");
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

/**
 *@swagger
 *components:
 *  responses:
 *      UtilisateurUpdated:
 *          description: l'utilisateur a été mis à jour
 *  requestBodies:
 *      UtilisateurAUpdate:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                           firstname:
 *                               type: string
 *                           name:
 *                               type: string
 *                           birthdate:
 *                               type: date
 *                           password:
 *                               type: string
 *                               format: password
 *                           photopath:
 *                               type: string
 */
module.exports.modifyUser = async(req, res) => {
    let doUpdate = false;
    let toUpdate = req.body;
    const idToUpdate = req.params.id;
    const newData = {};

    console.log(req.session);

    if(idToUpdate === req.session.userid || req.session.authLevel === "admin"){
        if (toUpdate.firstName !== undefined || toUpdate.name !== undefined ||
            toUpdate.birthDate !== undefined ||  toUpdate.password !== undefined || toUpdate.photoPath !== undefined){
            doUpdate = true;
        }
        if (doUpdate){
            const client = await pool.connect();
            newData.firstName = toUpdate.firstName;
            newData.name = toUpdate.name;
            newData.birthDate = toUpdate.birthDate;
            newData.password = toUpdate.password;
            newData.photoPath = toUpdate.photoPath;
            try{
                await UserController.modifyUser(client, idToUpdate, newData.firstName, newData.name, newData.birthDate,
                    newData.password, newData.photoPath);
                res.sendStatus(204);
            } catch (e) {
                console.error(e);
                res.sendStatus(500);
            } finally {
                client.release();
            }
        } else {
            res.sendStatus(400)
        }
    }else {
        res.sendStatus(403);
    }
}


/**
 * @swagger
 * components:
 *  responses:
 *      UtilisateursFound:
 *           description: renvoie tous les users dans un tableau
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/User'
 */
module.exports.getAllUsers = async(req, res) => {
    const client = await pool.connect();
    try{
        const result = await UserController.getAllUsers(client);
        res.json(result);
    } catch (e){
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}

/**
 * @swagger
 * components:
 *  responses:
 *      UtilisateurFound:
 *           description: renvoie un utilisateur en fonction de son identifian
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/User'
 */
module.exports.getUser = async(req, res) => {
    const userId = req.params.id;
    const client = await pool.connect();
    try{
        const result = await UserController.getUserById(client, userId);
        res.json(result);
    } catch (e){
        console.error(e);
        res.sendStatus(404);
    } finally {
        client.release();
    }
}