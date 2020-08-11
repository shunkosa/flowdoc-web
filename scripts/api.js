const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');
const flowParser = require('../node_modules/sfdx-flowdoc-plugin/lib/lib/flowParser').default;
const buildPdfContent = require('../node_modules/sfdx-flowdoc-plugin/lib/lib/pdf/pdfBuilder').default;
const buildDocxContent = require('../node_modules/sfdx-flowdoc-plugin/lib/lib/docx/docxBuilder').default;
const docx = require('docx');
const constant = require('./constant');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/flows', (req, res, next) => {
    (async () => {
        const accessToken = req.session.token.accessToken;
        const instanceUrl = req.session.token.instanceUrl;
        const conn = new jsforce.Connection({
            accessToken: accessToken,
            instanceUrl: instanceUrl,
            version: constant.API_VERSION
        });
        const users = await conn.query(`select username from user where id = '${req.session.token.userId}'`);
        const username = users.records[0].Username;
        const flowList = await conn.metadata.list({ type: 'Flow' }, constant.API_VERSION);
        if (!flowList) {
            res.json({
                flows: [],
                username: username,
                instanceUrl: instanceUrl
            });
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
                    f.isSupported = ['Workflow', 'CustomEvent', 'InvocableProcess'].includes(d.processType);
                    f.type = formatType[d.processType] ? formatType[d.processType] : 'Flow';
                    break;
                }
            }
        }
        res.json({
            flows: flowList,
            username: username,
            instanceUrl: instanceUrl
        });
    })().catch(next);
});

router.post('/pdf', (req, res) => {
    const flow = req.body.flow.detail;
    const name = req.body.name;
    const locale = req.body.locale;
    try {
        const fp = new flowParser(flow, name);
        const hrDoc = fp.createReadableProcess();
        const docDefinition = buildPdfContent(hrDoc, locale);
        res.json(docDefinition);
    } catch (error) {
        res.status(500).send({ error: error.stack });
    }
});

router.post('/docx', (req, res, next) => {
    (async () => {
        const flow = req.body.flow.detail;
        const name = req.body.name;
        const locale = req.body.locale;
        try {
            const fp = new flowParser(flow, name);
            const hrDoc = fp.createReadableProcess();
            const doc = buildDocxContent(hrDoc, locale);
            const base64string = await docx.Packer.toBase64String(doc);
            res.json({
                base64: base64string
            });
        } catch (error) {
            res.status(500).send({ error: error.stack });
        }
    })().catch(next);
});

router.get('/existense/session', (req, res) => {
    const token = req.session ? req.session.token : undefined;
    res.json({ hasSession: token !== undefined });
});

function chunk([...array], size = 1) {
    return array.reduce((acc, value, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]), []);
}

const formatType = {
    Workflow: 'Process - Record Trigger',
    CustomEvent: 'Process - Platform Event',
    InvocableProcess: 'Process - Invocable'
};

module.exports = router;
