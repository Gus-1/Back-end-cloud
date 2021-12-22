const Router = require("express-promise-router");
const router = new Router;
const AuthoMiddleware = require("../middleware/Authorization");
const eventController = require('../controleur/eventController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");


//Post
router.post('/', JWTMiddleWare.identification, eventController.insertEvent);

//Delete
router.delete('/:id', JWTMiddleWare.identification, eventController.deleteEvent);

//Update
router.patch('/:id', JWTMiddleWare.identification, eventController.modifyEvent);

//Get
router.get('/pending/', JWTMiddleWare.identification, eventController.getAllPending);
router.get('/joined/:id', eventController.getAllJoinedEvent);
router.get('/user/:id', eventController.getAllEventByUser);
router.get('/:id', JWTMiddleWare.identification, eventController.getEvent);
router.get('/', JWTMiddleWare.identification, eventController.getAllEvent);


module.exports = router;