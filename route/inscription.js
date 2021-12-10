const Router = require("express-promise-router");
const router = new Router;
const InscriptionController = require('../controleur/inscriptionController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");

//Post
router.post('/', JWTMiddleWare.identification,InscriptionController.linkUserEvent);

//Delete
router.delete('/:id', JWTMiddleWare.identification, InscriptionController.deleteUserFromEvent);

//Get
router.get('/:id' ,InscriptionController.getEventFromUser);
router.get('/', InscriptionController.getAllInscription);

//Patch
router.patch('/:id', InscriptionController.updateEventInscription);

module.exports = router;