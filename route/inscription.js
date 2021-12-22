const Router = require("express-promise-router");
const router = new Router;
const InscriptionController = require('../controleur/inscriptionController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");
const AuthoMiddleware = require("../middleware/Authorization");


//Post
router.post('/unlink/', JWTMiddleWare.identification,InscriptionController.unlinkUser);
router.post('/', JWTMiddleWare.identification,InscriptionController.linkUserEvent);

//Delete
router.delete('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin ,InscriptionController.deleteUserFromEvent);

//Get
router.get('/:id' ,InscriptionController.getEventFromUser);
router.get('/user/:id', JWTMiddleWare.identification, InscriptionController.getInscription);
router.get('/', JWTMiddleWare.identification, InscriptionController.getAllInscription);
router.get('/exist/', InscriptionController.inscriptionExist);

//Patch
router.patch('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin ,InscriptionController.updateEventInscription);

module.exports = router;