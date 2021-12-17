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
router.get('/pending/', eventController.getAllPending);
router.get('/:id', eventController.getEvent);
router.get('/', eventController.getAllEvent);
router.get('/user/:id', eventController.getAllEventByUser);
router.get('/joined/:id', eventController.getAllJoinedEvent);


module.exports = router;