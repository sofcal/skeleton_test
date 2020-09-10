const url = require('url');

/* eslint-disable */

class AuthHandler {
    constructor() {

    }

    static Create(...args) {
        return new AuthHandler(...args);
    }

    run(event) {
        const func = 'AuthHandler.run';

        const {
            authorization_id: authorizationId, /* bank, client_id: clientId, */ redirect_uri: redirectUri, state
        } = event.queryStringParameters;

        // validate the params

        const bcBaseUrl = `https://${url.parse(redirectUri).hostname}`;
        console.log(`banking cloud base url: ${bcBaseUrl}`);        // eslint-disable-line no-console

        event.logger.info({ function: func, log: 'ended' });
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html'
            },
            body: '' +
            '<!DOCTYPE html>' +
            '<html lang="en" class="template-starter template-collapsible">' +
            '<head>' +
            '<meta charset="utf-8">' +
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">' +
            '<title>Sage Provider API Skeleton Provider</title>' +
            '<!-- Roboto and Roboto Slab fonts by Google -->' +
            '<link href="https://fonts.googleapis.com/css?family=Roboto+Slab:300,400,700|Roboto:300,300i,400,400i,700,700i" rel="stylesheet">' +
            '<!-- Bootstrap core CSS -->' +
            `<link href="${bcBaseUrl}/dist/css/bootstrap.min.css" rel="stylesheet">` +
            `<link href="${bcBaseUrl}/dist/css/style.css" rel="stylesheet">` +
            `<link href="${bcBaseUrl}/dist/css/demo.css" rel="stylesheet">` +
            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">' +
            '<link rel="icon" href="data:;base64,iVBORw0KGgo=">' +
            '</head>' +
            '<body>' +
            '<header class="header" role="banner">' +
            '<div class="header-global">' +
            '<div class="container">' +
            `<div class="logo-product"><img src="${bcBaseUrl}/assets/img/logo-bank-feeds.png" alt="Sage" /></div>` +
            '</div>' +
            '</div>' +
            '</header>' +
            '<div class="master-wrapper">' +
            '<main class="main-body" id="content" role="main">' +
            '<div class="container">' +
            '<div class="row">' +
            '<div class="col-xs-8 offset-xs-2">' +
            '<div class="card">' +
            '<div class="card-block">' +
            '<div class="link-account en-GB">' +
            '<div class="header-icon text-sm-center">' +
            '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>' +
            '</div>' +

                `<iframe src="/v1/widget?authorization_id=${authorizationId}&state=${state}&redirect_uri=${redirectUri}" width="750" height="300"></iframe>` +

            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div><!-- /.container -->' +
                `<button onclick="window.location.href = '${redirectUri}?state=${state}';">CLICK ME!!!!</button>` +
            '</main>' +
            '</div>' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js" integrity="sha384-3ceskX3iaEnIogmQchP8opvBy3Mi7Ce34nWjpBIwVTHfGYWQS9jwHDVRnpKKHJg7" crossorigin="anonymous"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.3.7/js/tether.min.js" integrity="sha384-XTs3FgkjiBgo8qjEjBk0tGmf3wPrWtA6coPfQDfFEY8AnYJwjalXCiosYRBIBZX8" crossorigin="anonymous"></script>' +
            `<script src="${bcBaseUrl}/dist/js/bootstrap.min.js" async defer></script>` +
            '</body>' +
            '</html>'
        };
    }
}

module.exports = AuthHandler;
