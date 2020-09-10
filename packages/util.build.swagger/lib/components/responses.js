/**
 * @swagger
 *
 * components:
 *   responses:
 *     NotFound:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/HateoasResponse"
 *             example:
 *               data: 'null'
 *               links: 'null'
 *               meta: 'null'
 *               error:
 *                 code: NotFoundError
 *                 message: Statement with _id 00000000-0000-0000-0000-000000000001 was not found
 *                 detail: 'null'
 *     BadRequest:
 *       description: |-
 *         There was a problem processing the request due to the format or content of the request.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/HateoasResponse"
 *             example:
 *               data: 'null'
 *               links: 'null'
 *               meta: 'null'
 *               error:
 *                 code: ValidationError
 *                 message: One or more fields were missing, or failed to match the required specification
 *                 detail:
 *                   - target: 'StatementRequest.data.accountDetails[0].bankAccountId'
 *                     code: 'InvalidPropertyValue'
 *                     message: 'StatementRequest.data.accountDetails[0].bankAccountId does not match pattern "^[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$"'
 *                   - target: 'TransactionDetailRequest.data[0].transactionType'
 *                     code: 'InvalidPropertyValue'
 *                     message: 'TransactionDetailRequest.data[0].transactionType is not one of enum values: CREDIT,DEBIT,INT,DIV,FEE,SRVCHG,DEP,ATM,POS,XFER,CHECK,PAYMENT,CASH,DIRECTDEP,DIRECTDEBIT,REPEATPMT,HOLD,OTHER'
 *     UnsupportedOperationError:
 *       description: |-
 *         The resource is not in a state which supports the current operation
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/HateoasResponse"
 *             example:
 *               data: 'null'
 *               links: 'null'
 *               meta: 'null'
 *               error:
 *                 code: UnsupportedOperationError
 *                 message: A Statement already exists for this principalId, you must wait until it has finished processing
 *                 detail: 'null'
 *     InternalServerError:
 *       description: |-
 *         An unexpected error has occurred.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/HateoasResponse"
 *             example:
 *               data: 'null'
 *               links: 'null'
 *               meta: 'null'
 *               error:
 *                 code: InternalServerError
 *                 message: An error occurred while processing the request
 *                 detail: 'null'
 *     TooManyRequests:
 *       description: |
 *         Too many requests have been made by the caller in a short period of time, the caller must wait before trying
 *         again.
 *     Unauthenticated:
 *       description: |
 *         The token provided could not be authenticated.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/HateoasResponse"
 *             example:
 *               data: 'null'
 *               links: 'null'
 *               meta: 'null'
 *               error:
 *                 code: AuthenticationError
 *                 message: TBC - this would need to be mapped in API Gateway, or the Authorizer
 *                 detail: 'null'
 */
