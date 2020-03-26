// Simple Express server setup to serve the build output
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const path = require('path');
const session = require('express-session');

const authRouter = require('./auth');
const apiRouter = require('./api');

const app = express();
app.use(helmet());
app.use(compression());

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 5000;
const DIST_DIR = './dist';

app.use(
    session({
        secret: 'connection',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: app.get('env') === 'production'
        }
    })
);

app.use('/auth', authRouter);
app.use('/api', apiRouter);

app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});

app.get('/flows', (req, res) => {
    if (req.session.token) {
        res.sendFile(path.resolve(DIST_DIR, 'index.html'));
    } else {
        res.redirect('/');
    }
});

app.listen(PORT, () => console.log(`✅  Server started: http://${HOST}:${PORT}`));
