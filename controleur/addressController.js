const AddressController = require('../modele/addressDB');
const pool = require('../modele/database');


/**
 *@swagger
 *components:
 *  schemas:
 *      Address:
 *          type: object
 *          properties:
 *              addressId:
 *                  type: integer
 *              street:
 *                  type: string
 *                  description: nom de la rue
 *              number:
 *                  type: integer
 *              city:
 *                  type: string
 *                  description: nom de la ville
 *              postalcode:
 *                  type: integer
 *              country:
 *                  type: string
 *                  description: nom du pays
 */


/**
 *@swagger
 *components:
 *  responses:
 *      AdresseAjoute:
 *          description: L'adresse a été ajoutée
 *
 *  requestBodies:
 *      AdresseAAjoute:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          street:
 *                              type: string
 *                          number:
 *                              type: integer
 *                          city:
 *                              type: string
 *                          postCode:
 *                              type: integer
 *                          country:
 *                              type: string
 *
 *                      required:
 *                          - street
 *                          - number
 *                          - city
 *                          - postCode
 *                          - country
 */

//todo : Pour des raisons inexplicables, le saut d'id se fait toujours
module.exports.insertAddress = async(req, res) => {
    const {street, number, city, postCode, country} = req.body;
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



/**
 * @swagger
 * components:
 *  responses:
 *      AddressFound:
 *           description: renvoie toutes les addresses dans un tableau
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Produit'
 */
module.exports.getAllAddress = async(req, res) => {
    const client = await pool.connect();
    try{
        const result = await AddressController.getAllAddress(client);
        res.json(result);
    } catch (e) {
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
 *      AddressFound:
 *           description: renvoie un produit
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Produit'
 */
module.exports.getAddress = async(req, res) => {
    const addressId = req.params.id;
    const client = await pool.connect();
    try{
        const result = await AddressController.getAddress(client, addressId);
        res.json(result);
    } catch (e){
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
 *      AddressDeleted:
 *          description: l'addresse a été supprimée
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
 *          description: l'adresse a été mise à jour
 *  requestBodies:
 *      ProduitAUpdate:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                          street:
 *                              type: string
 *                          number:
 *                              type: integer
 *                          city:
 *                              type: string
 *                          postcode:
 *                              type: integer
 *                          country:
 *                              type: string
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