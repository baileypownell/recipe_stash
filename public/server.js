"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import path from 'path'
const express_1 = __importDefault(require("express"));
const bodyParser = require('body-parser');
const app = express_1.default();
const routes = require('./server/index.js');
const client = require('./server/client.js');
// var pg = require('pg'), 
var session = require('express-session'), pgSession = require('connect-pg-simple')(session);
// middleware
app.use(bodyParser.json());
app.use(express_1.default.json());
app.use((err, _, res, _2) => {
    res.json(err);
});
var environment = process.env.NODE_ENV || 'development';
let secret;
if (environment === 'development') {
    require('dotenv').config({
        path: './.env.development'
    });
    secret = 'skls2dk343lsdj43fl97865xkdk';
}
app.use(session({
    store: new pgSession({
        pool: client,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000, secure: false } // 1 hour
}));
app.use('/', routes);
const port = process.env.PORT || 3000;
app.use(express_1.default.static(__dirname + '/dist'));
// because I'm too cheap to pay $7/month for TLS (never do this for legit app)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';
app.get('*', (_, res) => {
    if (process.env.NODE_ENV === 'development') {
        res.sendFile(__dirname + '/dist/index.html');
    }
    else {
        res.sendFile('index.html', { root: './dist' });
    }
    // res.sendFile('index.html', { root: './dist' })
});
app.listen(port, () => {
    console.log('project up on port', port);
});
module.exports = app;
//# sourceMappingURL=server.js.map