"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("./client"));
const router = (0, express_1.Router)();
const jwt_decode = require('jwt-decode');
router.post('/', (request, response, next) => {
    const { token } = request.body;
    if (!token) {
        return response.status(400).json({
            success: false,
            message: 'Insufficient or invalid credentials provided.',
        });
    }
    const decodedToken = jwt_decode(token);
    client_1.default.query('SELECT * FROM users WHERE email=$1', [decodedToken.email], (err, res) => {
        if (err)
            return next(err);
        if (res.rows.length) {
            const user_uuid = res.rows[0].user_uuid;
            request.session.isAuthenticated = true;
            request.session.userID = user_uuid;
            return response.status(200).json({
                success: true,
            });
        }
        else {
            return response.status(404).json({ success: false });
        }
    });
});
exports.default = router;
//# sourceMappingURL=signinWithGoogle.js.map