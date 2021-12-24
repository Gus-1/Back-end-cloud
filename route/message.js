const Router = require("express-promise-router");
const router = new Router;
const messageController = require('../controleur/messageController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");

/**
 * @swagger
 *
 * components:
 *   responses:
 *     MessageToAddBadRequest:
 *       description: Mauvaise requête pour l'ajout d'un message
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/MessageToAddBadRequestResponse'
 *
 *   schemas:
 *     MessageToAddBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/AddMessageBadRequest'
 */

/**
 * @swagger
 *
 * /message:
 *  post:
 *      tags:
 *          - Message
 *      security:
 *          - bearerAuth: []
 *      description: Ajoute un établissement et renvoie son id
 *      requestBody:
 *          $ref: '#/components/requestBodies/MessageToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/MessageAdded'
 *          400:
 *              $ref: '#/components/responses/AddMessageBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          500:
 *              description: Erreur serveur
 */
router.post('/', JWTMiddleWare.identification, messageController.sendMessage);

/**
 * @swagger
 *
 * components:
 *   responses:
 *     MessageToDeleteBadRequest:
 *       description: Mauvaise requête pour la suppression d'un message
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/MessageToDeleteBadRequestResponse'
 *
 *   schemas:
 *     MessageToDeleteBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/DeleteMessageBadRequest'
 */

/**
 * @swagger
 *
 * /message/{id}:
 *  delete :
 *      tags:
 *          - Message
 *      security:
 *          - bearerAuth: []
 *      description: Supprime un message
 *      parameters:
 *        - name: id
 *          description: ID d'un message
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          204:
 *              $ref: '#/components/responses/MessageDeleted'
 *          400:
 *              $ref: '#/components/responses/DeleteMessageBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Le message n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */

router.delete('/:id', JWTMiddleWare.identification, messageController.deleteMessage);


/**
 * @swagger
 *
 * components:
 *   responses:
 *     MessageToUpdateBadRequest:
 *       description: Mauvaise requête pour la mise à jour d'un message
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/MessageToUpdateBadRequestResponse'
 *
 *   schemas:
 *     MessageToUpdateBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/UpdateMessageBadRequest'
 */

/**
 * @swagger
 *
 * /message/{id}:
 *  patch:
 *      tags:
 *          - Message
 *      security:
 *          - bearerAuth: []
 *      description: Modifie un message
 *      parameters:
 *        - name: id
 *          description: ID d'un message
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *          $ref: '#/components/requestBodies/MessageToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/MessageUpdated'
 *          400:
 *              $ref: '#/components/responses/UpdateMessageBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Le message n'a pas été trouvé dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.patch('/:id', JWTMiddleWare.identification, messageController.modifyMessage);

/**
 * @swagger
 *
 * components:
 *   responses:
 *     ConversationToGetBadRequest:
 *       description: Mauvaise requête pour la récupération d'une conversation
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/ConversationToGetBadRequestResponse'
 *
 *   schemas:
 *     ConversationToGetBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/ConversationRetrievedBadRequest'
 */

/**
 * @swagger
 *
 * /message/{id}:
 *  get:
 *      tags:
 *          - Message
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie une conversation
 *      parameters:
 *        - name: id
 *          description: ID d'un évènement
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/ConversationFound'
 *          400:
 *              $ref: '#/components/responses/ConversationRetrievedBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'évènement n'a pas été trouvé
 *          500:
 *              description: Erreur serveur
 */
router.get('/:id', JWTMiddleWare.identification,  messageController.getConversation);


/**
 * @swagger
 *
 * /message/owner/{id}:
 *  get:
 *      tags:
 *          - Message
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie un propriétaire d'un message
 *      parameters:
 *        - name: id
 *          description: ID d'un message
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/OwnerFound'
 *          400:
 *              $ref: '#/components/responses/OwnerRetrievedBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Le message n'a pas été trouvé
 *          500:
 *              description: Erreur serveur
 */
router.get('/owner/:id',JWTMiddleWare.identification ,messageController.getOwner);

module.exports = router;