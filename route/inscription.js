const Router = require("express-promise-router");
const router = new Router;
const InscriptionController = require('../controleur/inscriptionController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");
const AuthoMiddleware = require("../middleware/Authorization");

//Post
router.post('/', JWTMiddleWare.identification,InscriptionController.linkUserEvent);

//Delete
router.delete('/:id', JWTMiddleWare.identification, InscriptionController.deleteUserFromEvent);

//Get
router.get('/:id' ,InscriptionController.getEventFromUser);

module.exports = router;