const Router = require("express-promise-router");
const router = new Router;
const userController = require('../controleur/userController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");
const AuthoMiddleware = require("../middleware/Authorization");


//Post
router.post('/login', userController.login);
router.post('/', userController.addUser);

//Delete
router.delete('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, userController.deleteUser);

//Update
router.patch('/:id',JWTMiddleWare.identification, userController.modifyUser);

//Get
router.get('/', JWTMiddleWare.identification, userController.getAllUsers);
router.get('/:id', JWTMiddleWare.identification, userController.getUser);

module.exports = router;