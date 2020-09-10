/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     _preset_provider_apiKey:
 *       type: "apiKey"
 *       name: "x-api-key"
 *       in: "header"
 *     provider_auth_cloudId:
 *       type: "apiKey"
 *       name: "Authorization"
 *       in: "header"
 *       x-amazon-apigateway-authtype: "custom"
 *       x-amazon-apigateway-authorizer:
 *         authorizerUri:
 *           Fn::Sub:
 *             "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaArnPrefix}-AuthoriserCloudId/invocations"
 *         authorizerResultTtlInSeconds: 0
 *         type: "token"
 *     consumer_auth_jwt:
 *       type: "apiKey"
 *       name: "Authorization"
 *       in: "header"
 *       x-amazon-apigateway-authtype: "custom"
 *       x-amazon-apigateway-authorizer:
 *         authorizerUri:
 *           Fn::Sub:
 *             "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaArnPrefix}-AuthoriserJwt/invocations"
 *         authorizerResultTtlInSeconds: 0
 *         type: "token"
 */
