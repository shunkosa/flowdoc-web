const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');

const constant = require('./constant');

require('dotenv').config();

let oauth2;
let conn;

const oauth2options = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.CALLBACK_URL
};

router.get('/', (req, res) => {
    oauth2 = new jsforce.OAuth2(oauth2options);
    const orgType = req.param('orgtype');
    if (orgType === 'sandbox') {
        oauth2 = new jsforce.OAuth2({
            loginUrl: 'https://test.salesforce.com',
            ...oauth2options
        });
    }
    res.redirect(`${oauth2.getAuthorizationUrl({ scope: 'api refresh_token' })}&prompt=login%20consent`);
});

router.get('/callback', (req, res, next) => {
    (async () => {
        conn = new jsforce.Connection({ oauth2: oauth2, version: constant.API_VERSION });
        const code = req.param('code');
        await conn.authorize(code);
        req.session.token = {
            accessToken: conn.accessToken,
            instanceUrl: conn.instanceUrl,
            userId: conn.userInfo.id
        };
        res.redirect('/flows');
    })().catch(next);
});

router.get('/logout', (req, res, next) => {
    (async () => {
        if (conn.accessToken) {
            conn.logoutByOAuth2();
        }
        req.session.destroy();
        res.redirect('/');
    })().catch(next);
});

module.exports = router;
