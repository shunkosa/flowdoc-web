// Simple Express server setup to serve the build output
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const path = require('path');

const authRouter = require('./auth');
const apiRouter = require('./api');

const app = express();
app.use(helmet());
app.use(compression());

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 5000;
const DIST_DIR = './dist';

app.use('/auth', authRouter);
app.use('/api', apiRouter);

app.use(express.static(DIST_DIR));

app.get(['/', '/flows'], (req, res) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`✅  Server started: http://${HOST}:${PORT}`));
