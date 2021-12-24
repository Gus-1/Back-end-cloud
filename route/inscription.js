const Router = require("express-promise-router");
const router = new Router;
const InscriptionController = require('../controleur/inscriptionController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");
const AuthoMiddleware = require("../middleware/Authorization");


/**
 * @swagger
 *
 * components:
 *   responses:
 *     InscriptionToAddBadRequest:
 *       description: Mauvaise requête pour l'ajout d'une inscription
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/InscriptionToAddBadRequestResponse'
 *
 *   schemas:
 *     InscriptionToAddBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/LinkUserBadRequest'
 */

/**
 * @swagger
 *
 * /inscription:
 *  post:
 *      tags:
 *          - Inscription
 *      security:
 *          - bearerAuth: []
 *      description: Ajoute une personne à un évènement
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToLink'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/UserLinkedToEvent'
 *          400:
 *              $ref: '#/components/responses/LinkUserBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'utilisateur ou l'évènement n'a pas été trouvé
 *          409:
 *              description: Conflit, l'inscription existe déjà
 *          418:
 *              description: I'm a teapot ! Le nombre de participant a déjà atteint sa limite
 *          500:
 *              description: Erreur serveur
 */
router.post('/', JWTMiddleWare.identification,InscriptionController.linkUserEvent);




/**
 * @swagger
 *
 * components:
 *   responses:
 *     InscriptionToDeleteBadRequest:
 *       description: Mauvaise requête pour la suppression d'une inscription
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/InscriptionToDeleteBadRequestResponse'
 *
 *   schemas:
 *     InscriptionToDeleteBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/UnlinkUserBadRequest'
 */

/**
 * @swagger
 *
 * /inscription:
 *  post :
 *      tags:
 *          - Inscription
 *      security:
 *          - bearerAuth: []
 *      description: Supprime une inscription
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToUnlink'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/UserUnlinkedFromEvent'
 *          400:
 *              $ref: '#/components/responses/UnlinkUserBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'inscription et/ou l'utilisateur n'ont pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
//utilisée uniquement pour Android. Cas particulier
router.post('/unlink/', JWTMiddleWare.identification,InscriptionController.unlinkUser);


/**
 * @swagger
 *
 * /inscription/{id}:
 *  delete :
 *      tags:
 *          - Inscription
 *      security:
 *          - bearerAuth: []
 *      description: Supprime une inscription
 *      parameters:
 *        - name: id
 *          description: ID d'une inscription
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          204:
 *              $ref: '#/components/responses/InscriptionDeleted'
 *          400:
 *              $ref: '#/components/responses/DeleteInscriptionBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'inscription et/ou l'utilisateur n'ont pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.delete('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin ,InscriptionController.deleteUserFromEvent);



/**
 * @swagger
 *
 * components:
 *   responses:
 *     InscriptionToGetBadRequest:
 *       description: Mauvaise requête pour la récupération d'un établissement
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/InscriptionToGetBadRequestResponse'
 *
 *   schemas:
 *     InscriptionToGetBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/GetInscriptionBadRequest'
 */

/**
 * @swagger
 *
 * /inscription/user/{id}:
 *  get:
 *      tags:
 *          - Inscription
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie une inscription sur base de son id
 *      parameters:
 *        - name: id
 *          description: ID d'une inscription
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetInscriptionFound'
 *          400:
 *              $ref: '#/components/responses/GetInscriptionBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'inscription n'a pas été trouvé
 *          500:
 *              description: Erreur serveur
 */
router.get('/:id', JWTMiddleWare.identification, InscriptionController.getInscription);


/**
 * @swagger
 *
 * /inscription:
 *  get:
 *      tags:
 *          - Inscription
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie une liste de toutes les inscriptions
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllInscriptionFound'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'inscription n'a pas été trouvé
 *          500:
 *              description: Erreur serveur
 */
router.get('/', JWTMiddleWare.identification, InscriptionController.getAllInscription);



/**
 * @swagger
 *
 * components:
 *   responses:
 *     InscriptionToUpdateBadRequest:
 *       description: Mauvaise requête pour la mise à jour d'une inscription
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/InscriptionToUpdateBadRequestResponse'
 *
 *   schemas:
 *     InscriptionToUpdateBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/UpdateInscriptonBadRequest'
 */

/**
 * @swagger
 *
 * /inscription/{id}:
 *  patch:
 *      tags:
 *          - Inscription
 *      security:
 *          - bearerAuth: []
 *      description: Modifie une inscription
 *      parameters:
 *        - name: id
 *          description: ID d'une inscription
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *          $ref: '#/components/requestBodies/InscriptionToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/InscriptionUpdated'
 *          400:
 *              $ref: '#/components/responses/UpdateInscriptonBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: L'inscription à modifier n'a pas été trouvée dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.patch('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin ,InscriptionController.updateEventInscription);

module.exports = router;