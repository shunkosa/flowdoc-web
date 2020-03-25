const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');
const flowParser = require('../node_modules/sfdx-flowdoc-plugin/lib/lib/flowParser').default;
const renderer = require('../node_modules/sfdx-flowdoc-plugin/lib/lib/renderer').default;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/flows', (req, res, next) => {
    (async () => {
        const accessToken = req.body.access_token;
        const instanceUrl = req.body.instance_url;
        const conn = new jsforce.Connection({
            accessToken: accessToken,
            instanceUrl: instanceUrl,
            version: '48.0'
        });
        const flowList = await conn.metadata.list({ type: 'Flow' }, '48.0');
        if (!flowList) {
            res.json({ flows: [] });
            return;
        }
        const chunkedFullNames = chunk(
            flowList.map((f) => f.fullName),
            10
        );
        let detailedFlowList = [];
        for (const fullNames of chunkedFullNames) {
            // eslint-disable-next-line no-await-in-loop
            const result = await conn.metadata.read('Flow', fullNames);
            detailedFlowList = Array.isArray(result) ? [...detailedFlowList, ...result] : [...detailedFlowList, result];
        }
        for (const f of flowList) {
            f.formattedLastModifiedDate = new Date(f.lastModifiedDate).toLocaleString();
            for (const d of detailedFlowList) {
                if (f.fullName === d.fullName) {
                    f.detail = d;
                    f.isSupported = d.processType === 'Workflow';
                    break;
                }
            }
        }
        res.json({ flows: flowList });
    })().catch(next);
});

router.post('/pdf', (req, res) => {
    const flow = req.body.flow.detail;
    const name = req.body.name;
    const fp = new flowParser(flow);
    const r = new renderer(fp, 'en', name);
    const docDefinition = r.createDocDefinition();
    res.json(docDefinition);
});

function chunk([...array], size = 1) {
    return array.reduce((acc, value, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]), []);
}

module.exports = router;
