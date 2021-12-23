const Router = require("express-promise-router");
const router = new Router;
const AuthoMiddleware = require("../middleware/Authorization");
const addressController = require('../controleur/addressController');
const JWTMiddleWare = require("../middleware/IdentificationJWT");


/**
 * @swagger
 *
 * components:
 *   responses:
 *     AddressToAddBadRequest:
 *       description: Mauvaise requête pour l'ajout d'une adresse
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/AddressToAddBadRequestResponse'
 *
 *   schemas:
 *     AddressToAddBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/AddAddressBadRequest'
 */

/**
 * @swagger
 *
 * /address:
 *  post:
 *      tags:
 *          - Address
 *      security:
 *          - bearerAuth: []
 *      description: Ajoute une adresse
 *      requestBody:
 *          $ref: '#/components/requestBodies/AddressToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/AddressAdded'
 *          400:
 *              $ref: '#/components/responses/AddAddressBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          500:
 *              description: Erreur serveur
 */
router.post('/', JWTMiddleWare.identification, addressController.insertAddress);


/**
 * @swagger
 *
 * /address/{id}:
 *  delete :
 *      tags:
 *          - Address
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - name: id
 *          description: ID d'une adresse
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      description: Supprime une adresse
 *      responses:
 *          204:
 *              $ref: '#/components/responses/AddressDeleted'
 *          400:
 *              $ref: '#/components/responses/DeleteAddressBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: L'adresse n'a pas été trouvée dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.delete('/:id', JWTMiddleWare.identification, AuthoMiddleware.mustBeAdmin, addressController.deleteAddress);


/**
 * @swagger
 *
 * /address/{id}:
 *  patch:
 *      tags:
 *          - Address
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - name: id
 *          description: ID d'une adresse
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      description: Modifie une adresse
 *      requestBody:
 *          $ref: '#/components/requestBodies/AddressToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/AddressUpdated'
 *          400:
 *              $ref: '#/components/responses/UpdateAddressBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: L'adresse n'a pas été trouvée dans la base de données
 *          500:
 *              description: Erreur serveur
 */
router.patch('/:id', JWTMiddleWare.identification, addressController.updateAddress);


/**
 * @swagger
 *
 * components:
 *   responses:
 *     AddressToGetBadRequest:
 *       description: Mauvaise requête pour la récupération d'une adresse
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *             $ref: '#/components/schemas/AddressToGetBadRequestResponse'
 *
 *   schemas:
 *     AddressToGetBadRequestResponse:
 *       type: object
 *       oneOf:
 *         - $ref: '#/components/responses/ErrorJWT'
 *         - $ref: '#/components/responses/getAddressBadRequest'
 */


/**
 * @swagger
 *
 * /address/{id}:
 *  get:
 *      tags:
 *          - Address
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie un établissement
 *      parameters:
 *        - name: id
 *          description: ID d'une adresse
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AddressFound'
 *          400:
 *              $ref: '#/components/responses/getAddressBadRequest'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: L'adresse n'a pas été trouvée
 *          500:
 *              description: Erreur serveur
 */

router.get('/:id', JWTMiddleWare.identification, addressController.getAddress);

/**
 * @swagger
 *
 * /address:
 *  get:
 *      tags:
 *          - Address
 *      security:
 *          - bearerAuth: []
 *      description: Renvoie la liste de toutes les adresses
 *      responses:
 *          200:
 *              $ref: '#/components/responses/AllAddressFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/UnauthorizedJWT'
 *          404:
 *              description: Les adresses n'ont pas été trouvées
 *          500:
 *              description: Erreur serveur
 */
router.get('/', JWTMiddleWare.identification, addressController.getAllAddress);


module.exports = router;