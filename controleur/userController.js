const UserController = require('../modele/userDB');
const EventController = require('../modele/eventDB');
const pool = require('../modele/database');
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @swagger
 * components:
 *  schemas:
 *      Login:
 *          type: object
 *          properties:
 *              username:
 *                  type: string
 *              password:
 *                  type: string
 *                  format: password
 *          required:
 *              - username
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

module.exports.addUser = async (req, res) => {
    const {firstname, lastname, birthdate, email, password, photopath} = req.body;
    if(firstname === undefined || lastname === undefined || birthdate === undefined || email === undefined || password === undefined
    || photopath === undefined){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            await client.query("BEGIN");
            await UserController.addUser(client, firstname, lastname, birthdate, email, password, photopath);
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
}

module.exports.deleteUser = async(req, res) => {
    const id = req.params.id;
    if(isNaN(id)){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            if(await UserController.userExist(client, id)){
                await client.query("BEGIN");
                await EventController.deleteUsersEvent(client, id);
                await UserController.deleteUser(client, id);
                await client.query("COMMIT");
                res.sendStatus(204);
            }
            else {
                res.sendStatus(404);
            }
        } catch (e){
            await client.query("ROLLBACK");
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}

module.exports.modifyUser = async(req, res) => {
    let doUpdate = false;
    let toUpdate = req.body;
    const idToUpdate = req.params.id;
    const newData = {};

    if(idToUpdate === req.session.userid || req.session.authLevel === "admin"){
        if (toUpdate.firstname !== undefined || toUpdate.lastname !== undefined ||
            toUpdate.birthdate !== undefined ||  toUpdate.password !== undefined || toUpdate.photopath !== undefined){
            doUpdate = true;
        }
        if (doUpdate){
            const client = await pool.connect();
            newData.firstname = toUpdate.firstname;
            newData.lastname = toUpdate.lastname;
            newData.birthdate = toUpdate.birthdate;
            newData.password = toUpdate.password;
            newData.photopath = toUpdate.photopath;
            try{
                if (await UserController.userExist(client, idToUpdate)){
                    await UserController.modifyUser(client, idToUpdate, newData.firstname, newData.lastname, newData.birthdate,
                        newData.password, newData.photopath);
                    res.sendStatus(204);
                } else {
                    res.sendStatus(404);
                }
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


module.exports.getAllUsers = async(req, res) => {
    const client = await pool.connect();
    try{
        const {rows: result} = await UserController.getAllUsers(client);
        if (result !== undefined)
            res.json(result);
        else
            res.sendStatus(404);
    } catch (e){
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.getUser = async(req, res) => {
    const userId = req.params.id;
    if(isNaN(userId)){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        try{
            const result = await UserController.getUserById(client, userId);
            if (result !== undefined)
                res.json(result);
            else
                res.sendStatus(404);
        } catch (e){
            console.error(e);
            res.sendStatus(500);
        } finally {
            client.release();
        }
    }
}