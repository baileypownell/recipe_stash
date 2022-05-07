"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import path from 'path'
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = __importDefault(require("./index"));
const client_1 = __importDefault(require("./client"));
const app = (0, express_1.default)();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
// middleware
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use((err, _, res, _2) => {
    res.json(err);
});
const environment = process.env.NODE_ENV || 'development';
let secret;
if (environment === 'development') {
    require('dotenv').config({
        path: './.env.development'
    });
    secret = 'skls2dk343lsdj43fl97865xkdk';
}
app.use(session({
    store: new pgSession({
        pool: client_1.default,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000, secure: false } // 1 hour
}));
app.use('/', index_1.default);
app.use(express_1.default.static('./dist')); // this is key for serving up the bundle.js file and not the index.html file
const port = process.env.PORT || 3000;
// because I'm too cheap to pay $7/month for TLS (never do this for legit app)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.get('*', (_, res) => {
    res.sendFile('index.html', { root: './dist/' });
});
app.listen(port, () => {
    console.log('project up on port', port);
});
exports.default = app;
//# sourceMappingURL=server.js.map