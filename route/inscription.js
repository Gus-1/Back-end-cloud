const Router = require("express-promise-router");
const router = new Router;
const InscriptionController = require('../controleur/inscriptionController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");

//Post
router.post('/unlink/', JWTMiddleWare.identification,InscriptionController.unlinkUser);
router.post('/', JWTMiddleWare.identification,InscriptionController.linkUserEvent);

//Delete
router.delete('/:id', JWTMiddleWare.identification, InscriptionController.deleteUserFromEvent);

//Get
router.get('/:id' ,InscriptionController.getEventFromUser);
router.get('/user/:id', InscriptionController.getInscription);
router.get('/', InscriptionController.getAllInscription);
router.get('/exist/', InscriptionController.inscriptionExist);

//Patch
router.patch('/:id', InscriptionController.updateEventInscription);

module.exports = router;