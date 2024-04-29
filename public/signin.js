"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("./client"));
const bcrypt = require('bcryptjs');
const router = (0, express_1.Router)();
router.post('/', (request, response, next) => {
    const { password, email } = request.body;
    if (!password || !email) {
        return response.status(400).json({
            success: false,
            message: 'Insufficient or invalid credentials provided.',
        });
    }
    client_1.default.query('SELECT * FROM users WHERE email=$1', [email], (err, res) => {
        if (err)
            return next(err);
        if (res.rows.length) {
            let first_name, last_name, user_uuid;
            first_name = res.rows[0].first_name;
            last_name = res.rows[0].last_name;
            user_uuid = res.rows[0].user_uuid;
            const hashedPassword = res.rows[0].password;
            bcrypt.compare(password, hashedPassword, (err, res) => {
                if (err)
                    return next(err);
                if (res) {
                    request.session.isAuthenticated = true;
                    request.session.userID = user_uuid;
                    return response.status(200).json({
                        success: true,
                        userData: {
                            id: user_uuid,
                            first_name: first_name,
                            last_name: last_name,
                            email: email,
                        },
                    });
                }
                else {
                    return response
                        .status(403)
                        .json({ error: 'User could not be authenticated.' });
                }
            });
        }
        else {
            return response
                .status(403)
                .json({ error: 'Password or email is incorrect.' });
        }
    });
});
exports.default = router;
//# sourceMappingURL=signin.js.map