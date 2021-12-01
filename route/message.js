const Router = require("express-promise-router");
const router = new Router;
const messageController = require('../controleur/messageController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");

//Post
router.post('/', JWTMiddleWare.identification, messageController.sendMessage);

//Delete
router.delete('/:id', JWTMiddleWare.identification, messageController.deleteMessage);

//Update
router.patch('/:id', JWTMiddleWare.identification, messageController.modifyMessage);

//Get
router.get('/:id', messageController.getConversation);
router.get('/owner/:id', messageController.getOwner);

module.exports = router;