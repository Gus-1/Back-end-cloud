const UserController = require('../modele/userDB');
const pool = require('../modele/database');
const jwt = require("jsonwebtoken");


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
                "qwertyuiopasdfghjklzxcvbnm123456",
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

//todo:  Faire une transaction pour éviter un saut d'id
module.exports.addUser = async (req, res) => {
    const {firstName, lastName, birthDate, email, password, photoPath} = req.body;
    const client = await pool.connect();
    try{
        await client.query("BEGIN");
        //todo : query pour savoir si l'id existe

        await UserController.addUser(client, firstName, lastName, birthDate, email, password, photoPath);
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
 *      UserDeleted:
 *          description: L'utilisateur a été supprimé
 */
module.exports.deleteUser = async(req, res) => {
    const id = req.params.id;
    const client = await pool.connect();
    try{
        await UserController.deleteUser(client, id);
        res.sendStatus(204);
    } catch (e){
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

module.exports.modifyUser = async(req, res) => {
    let doUpdate = false;
    let toUpdate = req.body;
    const idToUpdate = req.params.id;
    const newData = {};

    if(idToUpdate === req.session.id || req.session.authLevel === "admin"){
        if (toUpdate.firstName !== undefined || toUpdate.name !== undefined ||
            toUpdate.birthDate !== undefined ||  toUpdate.password !== undefined || toUpdate.photoPath !== undefined){
            doUpdate = true;
        }
        if (doUpdate){
            const client = pool.connect();
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