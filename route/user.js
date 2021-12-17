const Router = require("express-promise-router");
const router = new Router;
const userController = require('../controleur/userController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");
const AuthoMiddleware = require("../middleware/Authorization");


//Post
router.post('/login', userController.login);
router.post('/', userController.addUser);

//Delete
router.delete('/:id',  userController.deleteUser);

//Update
router.patch('/:id',JWTMiddleWare.identification, userController.modifyUser);

//Get
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);

module.exports = router;