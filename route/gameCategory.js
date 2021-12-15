const Router = require("express-promise-router");
const router = new Router;
const gameCategoryController = require('../controleur/gameCategoryController');
const AuthoMiddleware = require("../middleware/Authorization");
const JWTMiddleWare = require("../middleware/IdentificationJWT");


//Post
router.post('/', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin ,gameCategoryController.insertCategory);

//Delete
router.delete('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, gameCategoryController.deleteCategory);

//Update
router.patch('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, gameCategoryController.updateCategory);

//Get
router.get('/', gameCategoryController.getAllCategory);
router.get('/:id', gameCategoryController.getCategoryById);

module.exports = router;