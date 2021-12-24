const Router = require("express-promise-router");
const router = new Router;
const userController = require('../controleur/userController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");
const AuthoMiddleware = require("../middleware/Authorization");


/**
 * @swagger
 * /user/login:
 *  post:
 *      tags:
 *          - User
 *      description: renvoie un JWT token permettant l'identification
 *      requestBody:
 *          description: login pour la connexion
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Login'
 *      responses:
 *          200:
 *            description: un token JWT
 *            content:
 *                text/plain:
 *                    schema:
 *                        type: string
 *          400:
 *            description: nom d'utilisateur ou mot de passe manquants
 *          401:
 *            description: mot de passe incorrect
 *          404:
 *            description: utilisateur inconnu
 *          500:
 *            description: erreur serveur
 *
 */
router.post('/login', userController.login);

/**
 * @swagger
 *
 * components:
 *   responses:
 *     UserToAddBadRequest:
 *       description: Mauvaise requête pour l'ajout d'un utilisateur
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/UserToAddBadRequestResponse'
 *
 *   schemas:
 *     UserToAddBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/AddUserBadRequest'
 */

/**
 * @swagger
 *
 * /user:
 *  post:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      description: Ajoute un utilisateur
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/UserAdded'
 *          400:
 *              $ref: '#/components/responses/AddUserBadRequest'
 *          500:
 *              description: Erreur serveur
 */

router.post('/', userController.addUser);

/**
 * @swagger
 *
 * components:
 *   responses:
 *     UserToDeleteBadRequest:
 *       description: Mauvaise requête pour la suppression d'un utilisateur
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/UserToDeleteBadRequestResponse'
 *
 *   schemas:
 *     UserToDeleteBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/DeleteUserBadRequest'
 */

/**
 * @swagger
 *
 * /user/{id}:
 *  delete :
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      description: Supprime un utilisateur
 *      parameters:
 *        - name: id
 *          description: ID d'un utilisateur
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          204:
 *              $ref: '#/components/responses/UserDeleted'
 *          400:
 *              $ref: '#/components/responses/DeleteUserBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: L'utilisateur n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.delete('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, userController.deleteUser);


/**
 * @swagger
 *
 * components:
 *   responses:
 *     UserToUpdateBadRequest:
 *       description: Mauvaise requête pour la mise à jour d'un utilisteur
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/UserToUpdateBadRequestResponse'
 *
 *   schemas:
 *     UserToUpdateBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/UpdateUserBadRequest'
 */

/**
 * @swagger
 *
 * /user/grant/{id}:
 *  patch:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      description: Modifie un en lui accordant ou enlevant un statut d'administrateur
 *      parameters:
 *        - name: id
 *          description: ID d'un utilisateur
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToGrant'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/UserGranted'
 *          400:
 *              $ref: '#/components/responses/GrantUserBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: L'utilisateur n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.patch('/grant/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, userController.grantUser)

/**
 * @swagger
 *
 * /user/{id}:
 *  patch:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      description: Modifie un utilisateur
 *      parameters:
 *        - name: id
 *          description: ID d'un utilisateur
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/UserUpdated'
 *          400:
 *              $ref: '#/components/responses/UpdateUserBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'utilisateur n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.patch('/:id',JWTMiddleWare.identification, userController.modifyUser);

/**
 * @swagger
 *
 * components:
 *   responses:
 *     UserToGetBadRequest:
 *       description: Mauvaise requête pour la récupération d'un utilisateur
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/UserToGetBadRequestResponse'
 *
 *   schemas:
 *     UserToGetBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/UserRetrievedBadRequest'
 */

/**
 * @swagger
 *
 * /user:
 *  get:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie tous les utilisateurs
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllUserFound'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Aucun utilisateur n'a pas été trouvé
 *          500:
 *              description: Erreur serveur
 */
router.get('/', JWTMiddleWare.identification, userController.getAllUsers);



/**
 * @swagger
 *
 * /user/{id}:
 *  get:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie un utilisateur
 *      parameters:
 *        - name: id
 *          description: ID d'un utilisteur
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/UserFound'
 *          400:
 *              $ref: '#/components/responses/UserRetrievedBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'utilisateur n'a pas été trouvé
 *          500:
 *              description: Erreur serveur
 */
router.get('/:id', JWTMiddleWare.identification, userController.getUser);

module.exports = router;