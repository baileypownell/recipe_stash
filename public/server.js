"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const client_1 = __importDefault(require("./client"));
const index_1 = __importDefault(require("./index"));
const app = (0, express_1.default)();
const pgSession = require('connect-pg-simple')(express_session_1.default);
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use((err, _, res, _2) => {
    res.json(err);
});
const environment = process.env.NODE_ENV || 'development';
let secret;
if (environment === 'development') {
    require('dotenv').config({
        path: './.env.development',
    });
    secret = 'skls2dk343lsdj43fl97865xkdk';
}
app.use((0, express_session_1.default)({
    store: new pgSession({
        pool: client_1.default,
        tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
}));
app.use('/', index_1.default);
app.use(express_1.default.static('./dist'));
const port = process.env.PORT || 3000;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.get('*', (_, res) => {
    res.sendFile('index.html', { root: './dist/' });
});
app.listen(port, () => {
    console.log('project up on port', port);
});
exports.default = app;
//# sourceMappingURL=server.js.map