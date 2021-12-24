const Router = require("express-promise-router");
const router = new Router;
const AuthoMiddleware = require("../middleware/Authorization");
const eventController = require('../controleur/eventController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");


/**
 * @swagger
 *
 * components:
 *   responses:
 *     EventToAddBadRequest:
 *       description: Mauvaise requête pour l'ajout d'un évènement
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/EventToAddBadRequestResponse'
 *
 *   schemas:
 *     EventToAddBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/AddEventBadRequest'
 */

/**
 * @swagger
 *
 * /event:
 *  post:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Ajoute un évènement
 *      requestBody:
 *          $ref: '#/components/requestBodies/EventToAdd'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/EventAdded'
 *          400:
 *              $ref: '#/components/responses/AddEventBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          500:
 *              description: Erreur serveur
 */

router.post('/', JWTMiddleWare.identification, eventController.insertEvent);



/**
 * @swagger
 *
 * components:
 *   responses:
 *     EventToDeleteBadRequest:
 *       description: Mauvaise requête pour la suppression d'un évènement
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/EventToDeleteBadRequestResponse'
 *
 *   schemas:
 *     EventToDeleteBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/DeleteEventBadRequest'
 */

/**
 * @swagger
 *
 * /event/{id}:
 *  delete :
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Supprime un évènement
 *      parameters:
 *        - name: id
 *          description: ID d'un évènement
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          204:
 *              $ref: '#/components/responses/EventDeleted'
 *          400:
 *              $ref: '#/components/responses/DeleteEventBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'évènement n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.delete('/:id', JWTMiddleWare.identification, eventController.deleteEvent);

/**
 * @swagger
 *
 * components:
 *   responses:
 *     EventToUpdateBadRequest:
 *       description: Mauvaise requête pour la mise à jour d'un évènement
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/EventToUpdateBadRequestResponse'
 *
 *   schemas:
 *     EventToUpdateBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/UpdateEventBadRequest'
 */

/**
 * @swagger
 *
 * /event/verify/{id}:
 *  patch:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Modifie un évènement
 *      parameters:
 *        - name: id
 *          description: ID d'un évènement
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *          $ref: '#/components/requestBodies/EventToVerify'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/EventVerified'
 *          400:
 *              $ref: '#/components/responses/VerifyEventBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: L'évènement n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */

router.patch('/verify/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, eventController.checkEvent);

/**
 * @swagger
 *
 * /event/{id}:
 *  patch:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Modifie un évènement
 *      parameters:
 *        - name: id
 *          description: ID d'un évènement
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *          $ref: '#/components/requestBodies/EventToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/EventUpdated'
 *          400:
 *              $ref: '#/components/responses/UpdateEventBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'évènement ou son adresse n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.patch('/:id', JWTMiddleWare.identification, eventController.modifyEvent);


/**
 * @swagger
 *
 * components:
 *   responses:
 *     EventToGetBadRequest:
 *       description: Mauvaise requête pour la récupération d'un évènement
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/EventToGetBadRequestResponse'
 *
 *   schemas:
 *     EventToGetBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/GetEventBadRequest'
 */

/**
 * @swagger
 *
 * /event/pending:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie la liste de tous les évènements en attente de validation
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllPendingEventFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: Les évènements n'ont pas été trouvées
 *          500:
 *              description: Erreur serveur
 */

router.get('/pending/', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, eventController.getAllPending);


/**
 * @swagger
 *
 * /event/joined/{id}:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie la liste de tous les évènements
 *      parameters:
 *        - name: id
 *          description: ID d'un évènement
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllJoinedEventFound'
 *          400:
 *              $ref: '#/components/responses/AllJoinedEventBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Les évènements n'ont pas été trouvées
 *          500:
 *              description: Erreur serveur
 */
router.get('/joined/:id', JWTMiddleWare.identification, eventController.getAllJoinedEvent);

/**
 * @swagger
 *
 * /event/user/{id}:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie la liste de tous les évènements d'un utilisateur
 *      parameters:
 *        - name: id
 *          description: ID d'un évènement
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllEventByUserFound'
 *          400:
 *              $ref: '#/components/responses/AllEventByUserBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Les évènements n'ont pas été trouvées
 *          500:
 *              description: Erreur serveur
 */
router.get('/user/:id', JWTMiddleWare.identification, eventController.getAllEventByUser);

/**
 * @swagger
 *
 * /event/{id}:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie un évènement
 *      parameters:
 *        - name: id
 *          description: ID d'un évènement
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetEventFound'
 *          400:
 *              $ref: '#/components/responses/GetEventBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'évènement n'a pas été trouvé
 *          500:
 *              description: Erreur serveur
 */

router.get('/:id', JWTMiddleWare.identification, eventController.getEvent);

/**
 * @swagger
 *
 * /event:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie la liste de tous les évènements
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllEventFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Les évènements n'ont pas été trouvées
 *          500:
 *              description: Erreur serveur
 */
router.get('/', JWTMiddleWare.identification, eventController.getAllEvent);


module.exports = router;