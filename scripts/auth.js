const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');

require('dotenv').config();

let oauth2;

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
    res.redirect(oauth2.getAuthorizationUrl({ scope: 'api refresh_token' }));
});

router.get('/callback', (req, res, next) => {
    (async () => {
        const conn = new jsforce.Connection({ oauth2: oauth2, version: '48.0' });
        const code = req.param('code');
        await conn.authorize(code);
        res.cookie('access_token', conn.accessToken);
        res.cookie('instance_url', conn.instanceUrl);
        res.redirect('/flows');
    })().catch(next);
});

module.exports = router;
