const AddressController = require('../modele/addressDB');
const pool = require('../modele/database');

module.exports.insertAddress = async(req, res) => {
    const {street, number, city, postCode, country} = req.body;
    const client = await pool.connect();
    try{
        await client.query(`BEGIN`);
        await AddressController.insertAddress(client, street, number, city, postCode, country);
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