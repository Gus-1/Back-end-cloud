const Router = require("express-promise-router");
const router = new Router;
const gameCategoryController = require('../controleur/gameCategoryController');
const AuthoMiddleware = require("../middleware/Authorization");
const JWTMiddleWare = require("../middleware/IdentificationJWT");

/**
 * @swagger
 *
 * components:
 *   responses:
 *     GameCategoryToAddBadRequest:
 *       description: Mauvaise requête pour l'ajout d'une catégorie
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/GameCategoryToAddBadRequestResponse'
 *
 *   schemas:
 *     GameCategoryToAddBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/AddGameCategoryBadRequest'
 */

/**
 * @swagger
 *
 * /gameCategory:
 *  post:
 *      tags:
 *          - GameCategory
 *      security:
 *          - bearerAuth: []
 *      description: Ajoute une catégorie
 *      requestBody:
 *          $ref: '#/components/requestBodies/GameCategoryToAdd'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GameCategoryAdded'
 *          400:
 *              $ref: '#/components/responses/AddGameCategoryBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          500:
 *              description: Erreur serveur
 */
router.post('/', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin ,gameCategoryController.insertCategory);

/**
 * @swagger
 *
 * components:
 *   responses:
 *     GameCategoryToDeleteBadRequest:
 *       description: Mauvaise requête pour la suppression d'une catégorie
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/GameCategoryToDeleteBadRequestResponse'
 *
 *   schemas:
 *     GameCategoryToDeleteBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/DeleteGameCategoryBadRequest'
 */


/**
 * @swagger
 *
 * /gameCategory/{id}:
 *  delete :
 *      tags:
 *          - GameCategory
 *      security:
 *          - bearerAuth: []
 *      description: Supprime une catégorie
 *      parameters:
 *        - name: id
 *          description: ID d'une catégorie
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          204:
 *              $ref: '#/components/responses/GameCategoryDeleted'
 *          400:
 *              $ref: '#/components/responses/DeleteGameCategoryBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: La catégorie n'a pas été trouvée dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.delete('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, gameCategoryController.deleteCategory);


/**
 * @swagger
 *
 * components:
 *   responses:
 *     GameCategoryToUpdateBadRequest:
 *       description: Mauvaise requête pour la mise à jour d'une catégorie
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/GameCategoryToUpdateBadRequestResponse'
 *
 *   schemas:
 *     GameCategoryToUpdateBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/GameCategoryBadRequest'
 */

/**
 * @swagger
 *
 * /gameCategory/{id}:
 *  patch:
 *      tags:
 *          - GameCategory
 *      security:
 *          - bearerAuth: []
 *      description: Modifie une catégorie
 *      parameters:
 *        - name: id
 *          description: ID d'une catégorie
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *          $ref: '#/components/requestBodies/GameCategoryToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/GameCategoryUpdated'
 *          400:
 *              $ref: '#/components/responses/GameCategoryBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: La catégorie n'a pas été trouvée dans la base de données
 *          500:
 *              description: Erreur serveur
 */


router.patch('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, gameCategoryController.updateCategory);


/**
 * @swagger
 *
 * components:
 *   responses:
 *     GameCategoryToGetBadRequest:
 *       description: Mauvaise requête pour la récupération des catégories
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/GameCategoryToGetBadRequestResponse'
 *
 *   schemas:
 *     GameCategoryToGetBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 */

/**
 * @swagger
 *
 * /gameCategory:
 *  get:
 *      tags:
 *          - GameCategory
 *      description: Renvoie la liste de toutes les catégories
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllCategoryFound'
 *          404:
 *              description: Les catégories n'ont pas été trouvées
 *          500:
 *              description: Erreur serveur
 */
router.get('/', gameCategoryController.getAllCategory);


/**
 * @swagger
 *
 * /gameCategory/{id}:
 *  get:
 *      tags:
 *          - GameCategory
 *      description: Renvoie une catégorie sur base de l'id
 *      parameters:
 *        - name: id
 *          description: ID d'une adresse
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/CategoryByIdFound'
 *          400:
 *              $ref: '#/components/responses/CategoryByIdBadRequest'
 *          404:
 *              description: L'adresse n'a pas été trouvée
 *          500:
 *              description: Erreur serveur
 */
router.get('/:id', gameCategoryController.getCategoryById);

module.exports = router;