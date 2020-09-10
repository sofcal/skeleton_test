/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Empty:
 *       type: object
 *     providerAdditionalField:
 *       type: object
 *       description: |
 *         Additional metadata supplied by banking partners
 *       properties:
 *         name:
 *          type: string
 *          pattern: '^.{1,50}$'
 *          description: |
 *            Provider-defined name
 *         value:
 *           type: string
 *           pattern: '^.{1,50}$'
 *           description: |
 *             Provider-defined value
 */
