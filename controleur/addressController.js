const AddressController = require('../modele/addressDB');
const pool = require('../modele/database');


/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         addressId:
 *           type: integer
 *         street:
 *           type: string
 *         number:
 *           type: string
 *         country:
 *           type: string
 *         city:
 *           type: string
 *         postalCode:
 *           type: string
 */


/**
 *@swagger
 *components:
 *  responses:
 *      AddressAdded:
 *          description: L'adresse a été ajoutée
 *      AddAddressBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      AddressToAdd:
 *          description : Adresse a ajouter
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                        street:
 *                          type: string
 *                        number:
 *                          type: integer
 *                        country:
 *                          type: string
 *                        city:
 *                          type: string
 *                        postalCode:
 *                          type: integer
 *                      required:
 *                          - street
 *                          - number
 *                          - country
 *                          - city
 *                          - postalCode
 */

module.exports.insertAddress = async(req, res) => {
    const {street, number, city, postCode, country} = req.body;
    if(street === undefined || number === undefined || city === undefined || postCode === undefined || country === undefined){
        res.sendStatus(400);
    } else {
        const client = await pool.connect();
        await client.query(`BEGIN;`);
        try{
            await AddressController.insertAddress(client, street, number, city, postCode, country);
            await client.query(`COMMIT;`);
            res.sendStatus(201);
        } catch (e){
            console.error(e);
            await client.query(`ROLLBACK;`);
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
 *      AllAddressFound:
 *          description: Renvoie un tableau contenant toutes les adresses
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Address'
 */
//J'ai enlevé la bad request
module.exports.getAllAddress = async(req, res) => {
    const client = await pool.connect();
    try{
        const {rows: result} = await AddressController.getAllAddress(client);
        if(result !== undefined)
            res.json(result);
        else
            res.sendStatus(404);
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
 *      AddressFound:
 *          description: Renvoie une addresse sur base d'un id fourni
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Address'
 *      getAddressBadRequest:
 *          description: L'id fournie doit être définie
 */

module.exports.getAddress = async(req, res) => {
    const addressId = req.params.id;
    const client = await pool.connect();
    if(isNaN(addressId)){
        res.sendStatus(400);
    } else {
        try{
            const {rows: result} = await AddressController.getAddress(client, addressId);
            if(result !== undefined)
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


/**
 *@swagger
 *components:
 *  responses:
 *      AddressDeleted:
 *          description: L'adresse de l'évènement a été supprimée
 *      DeleteAddressBadRequest:
 *          description: l'id de l'adresse doit être fourni
 */

module.exports.deleteAddress = async (req, res) => {
    const addressId = req.params.id;
    const client = await pool.connect();
    try{
        await AddressController.deleteAddress(client, addressId);
        res.sendStatus(204);
    } catch(e){
        console.error(e);
        res.sendStatus(403);
    } finally {
        client.release();
    }
}


/**
 *@swagger
 *components:
 *  responses:
 *      AddressUpdated:
 *          description: L'utilisateur a été modifié
 *      UpdateAddressBadRequest:
 *          description: Tous les champs du corps de la requête doivent être définis
 *  requestBodies:
 *      AddressToUpdate:
 *          description : Utilisateur à mettre à jour
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          street:
 *                              type: string
 *                          number:
 *                              type: integer
 *                          country:
 *                              type: string
 *                          city:
 *                              type: string
 *                          postalCode:
 *                              type: integer
 *                      required:
 *                          - street
 *                          - number
 *                          - country
 *                          - city
 *                          - postalCode
 */

module.exports.updateAddress = async(req, res) => {
    let doUpdate = false;
    let toUpdate = req.body;
    const addressId = req.params.id;
    const newData = {};
    if (toUpdate.street !== undefined || toUpdate.number !== undefined || toUpdate.city !== undefined ||
        toUpdate.postCode !== undefined || toUpdate.country !== undefined)
        doUpdate = true;
    if(doUpdate) {
        const client = await pool.connect();
        newData.street = toUpdate.street;
        newData.number = toUpdate.number;
        newData.city = toUpdate.city;
        newData.postCode = toUpdate.postCode;
        newData.country = toUpdate.country;
        try{
            await AddressController.updateAddress(client, addressId ,newData.street, newData.number, newData.city, newData.postCode,
                newData.country);
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
}