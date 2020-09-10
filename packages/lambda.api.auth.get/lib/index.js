'use strict';

/**
 * This is the entry point for this lambda function. By separating it from the implementation, we are able to test
 * more concisely; avoid adding implementation details to this file where possible.
 */

const AWS = require('aws-sdk');
const Promise = require('bluebird');
const Lambda = require('./Lambda');

// set AWS to use bluebird promises - this ensures we have access to finally blocks and other useful tools
AWS.config.setPromisesDependency(Promise);

// call into our implementation to perform the work. This instance will exist for the lifespan of this lambda. Passing
// process.env here ensures we don't have to reference it within our implementation, making testing easier
const issuer = Lambda.Create({ config: process.env });

/**
 * @swagger
 *
 * /v1/auth:
 *   get:
 *     operationId: getAuth
 *     summary: Auth POST
 *     description: |-
 *        handles auth flow from Provider API
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: bank
 *         schema:
 *           type:
 *             string
 *         description:
 *           The sage id of the bank that the user of the Sage Banking service has chosen to on-board with.
 *       - in: query
 *         name: authorisation_id
 *         schema:
 *           type:
 *             string
 *         description:
 *           UUID of the authorisation session within the Sage Banking Service.  Following an authorisation this
 *           ID is used in conjunction with Patch Auth to inform the Banking Service of authorised accounts.
 *           It can be used to optionally validate against the authorisation id received on the web hook notification.
 *       - in: query
 *         name: redirect_uri
 *         schema:
 *           type:
 *             string
 *         description:
 *           Url to redirect to upon success or failure.   The value of the State query parameter should be appended to this when redirecting.
 *       - in: query
 *         name: state
 *         schema:
 *           type:
 *             string
 *         description:
 *           uuid to be appended to redirect_uri when redirecting
 *     responses:
 *       200:
 *         description: The UI was correctly formed.
 *         content:
 *           text/html:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthenticated'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/UnsupportedOperationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *     x-amazon-apigateway-integration:
 *         uri:
 *           Fn::Sub:
 *             arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaArnPrefix}-ApiAuth/invocations
 *         responses:
 *           default:
 *             statusCode: "200"
 *         passthroughBehavior: "when_no_match"
 *         httpMethod: "POST"
 *         contentHandling: "CONVERT_TO_TEXT"
 *         type: "aws_proxy"
 *         credentials:
 *           Fn::GetAtt:
 *           - RoleAPIGatewayInvokeLambda
 *           - Arn
 * /v1/widget:
 *   get:
 *     operationId: getWidget
 *     summary: Auth GET
 *     description: |-
 *        mimics the behaviour of third parties who generally provide an iframe or script tags
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: The UI was correctly formed.
 *         content:
 *           text/html:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthenticated'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/UnsupportedOperationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *     x-amazon-apigateway-integration:
 *         uri:
 *           Fn::Sub:
 *             arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaArnPrefix}-ApiAuth/invocations
 *         responses:
 *           default:
 *             statusCode: "200"
 *         passthroughBehavior: "when_no_match"
 *         httpMethod: "POST"
 *         contentHandling: "CONVERT_TO_TEXT"
 *         type: "aws_proxy"
 *         credentials:
 *           Fn::GetAtt:
 *           - RoleAPIGatewayInvokeLambda
 *           - Arn
 */
module.exports.run = (event, context, callback) => issuer.run(event, context, callback);
