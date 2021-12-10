const Router = require("express-promise-router");
const router = new Router;
const AuthoMiddleware = require("../middleware/Authorization");
const addressController = require('../controleur/addressController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");


//Post
router.post('/', JWTMiddleWare.identification, addressController.insertAddress);

//Delete
router.delete('/:id', JWTMiddleWare.identification, addressController.deleteAddress);

//Update
router.patch('/:id', JWTMiddleWare.identification, addressController.updateAddress);

//Get
router.get('/:id', addressController.getAddress);
router.get('/', addressController.getAllAddress);


module.exports = router;