const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const jsforce = require('jsforce');

require('dotenv').config();

const oauth2options = {
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri : process.env.CALLBACK_URL
}

let oauth2;
let conn;

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/auth/production', (req, res) => {
    oauth2 = new jsforce.OAuth2(oauth2options);
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'api refresh_token' }));
  })
  .get('/auth/sandbox', (req, res) => {
    oauth2 = new jsforce.OAuth2({
      loginUrl : 'https://test.salesforce.com',
      ...oauth2options
    });
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'api refresh_token' }));
  })
  .get('/oauth2/callback', (req, res) => {
    conn = new jsforce.Connection({ oauth2 : oauth2, version: '48.0' });
    const code = req.param('code');
    conn.authorize(code, (err, userInfo) => {
      if (err) { return console.error(err); }
      res.redirect(req.baseUrl + '/flows');
    });
  })
  .get('/flows', (req, res, next) => {
    (async () => {
      if(!conn || !conn.accessToken) {
        res.redirect(req.baseUrl + '../');
      }
      const flowList = await getFlows(conn);
      const count = flowList.filter(f => f.detail.processType === 'Workflow').length;
      res.render('pages/flows', { flowList : flowList, count: count });
    })().catch(next);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


getFlows = async (conn) => {
  const types = [{type: 'Flow'}];
  const flowList = await conn.metadata.list(types, '48.0');
  const chunkedFullNames = chunk(flowList.map(f => f.fullName), 10);
  let detailedFlowList = [];
  for(const fullNames of chunkedFullNames) {
    const result = await conn.metadata.read('Flow', fullNames);
    detailedFlowList = Array.isArray(result) ? [...detailedFlowList, ...result] : [...detailedFlowList, result];
  }
  for(const f of flowList) {
    f.formattedLastModifiedDate = (new Date(f.lastModifiedDate)).toLocaleString();
    for(const d of detailedFlowList) {
      if(f.fullName === d.fullName) {
        f.detail = d;
        break;
      }
    }
  }
  return flowList;
}

chunk = ([...array], size = 1) => {
  return array.reduce((acc, value, index) => index % size ? acc : [...acc, array.slice(index, index + size)], []);
}