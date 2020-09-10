/* eslint-disable */

const url = require('url');

class WidgetHandler {
    constructor() {

    }

    static Create(...args) {
        return new WidgetHandler(...args);
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
            '<body style="background-color: transparent;">' +
                '<div>' +
                    '<h3>Sage Provider Api Skeleton Bank</h3>' +
                    '<p>This is a <strong>Skeleton Bank</strong>, provided by Sage, to demonstrate the connectivity of Sage Provider Api.</p>' +
                    '<p>Any username/password can be entered in the form below to imitate a sign-in to a real bank account.</p>' +
                    '<form id="register_form" action="/v1/callback" method="post">' +
                        'Username:<br>' +
                        '<input type="text" name="username"><br>' +
                        'Password:<br>' +
                        '<input type="password" name="password"><br><br>' +
                        // because this demo does not have any internal cache for state, we're embedding the state and
                        // redirect in the form, so we can use it later.
                        `<input type="hidden" id="state" name="state" value="${state}">` +
                        `<input type="hidden" id="redirectUri" name="redirectUri" value="${redirectUri}">` +
                        `<input type="hidden" id="authorizationId" name="authorizationId" value="${authorizationId}">` +

                        '<input type="submit" value="Submit" class="btn btn-primary margin-right-10 demo-continue user_choices__buttons">' +
                    '</form>' +
                '</div>' +

                '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js" integrity="sha384-3ceskX3iaEnIogmQchP8opvBy3Mi7Ce34nWjpBIwVTHfGYWQS9jwHDVRnpKKHJg7" crossorigin="anonymous"></script>' +
                '<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.3.7/js/tether.min.js" integrity="sha384-XTs3FgkjiBgo8qjEjBk0tGmf3wPrWtA6coPfQDfFEY8AnYJwjalXCiosYRBIBZX8" crossorigin="anonymous"></script>' +
                `<script src="${bcBaseUrl}/dist/js/bootstrap.min.js" async defer></script>` +
            '</body>' +
            '</html>'
        };
    }
}

module.exports = WidgetHandler;
