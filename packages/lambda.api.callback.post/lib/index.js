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
 * /v1/callback:
 *   post:
 *     operationId: postCallback
 *     summary: Callback POST
 *     description: |-
 *        handles callback from Provider API
 *     tags:
 *       - Callback
 *     requestBody:
 *       description: |
 *         TBC
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 200 response
 *         content:
 *           application/json:
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
 *             arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaArnPrefix}-ApiCallback/invocations
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
