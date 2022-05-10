"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("./client"));
const bcrypt = require('bcryptjs');
const router = express_1.Router();
router.post('/', (request, response, next) => {
    const { password, email } = request.body;
    if (!password || !email) {
        return response.status(400).json({ success: false, message: 'Insufficient or invalid credentials provided.' });
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
                    request.session.regenerate(() => {
                        request.session.save();
                        const sessionIdentifier = request.sessionID;
                        // update the session table with the user's sessionID
                        client_1.default.query('UPDATE session SET user_uuid=$1 WHERE sid=$2', [user_uuid, sessionIdentifier], (err, res) => {
                            if (err)
                                return next(err);
                            if (res.rowCount) {
                                return response.status(200).json({
                                    success: true,
                                    sessionID: sessionIdentifier,
                                    userData: {
                                        id: user_uuid,
                                        first_name: first_name,
                                        last_name: last_name,
                                        email: email
                                    }
                                });
                            }
                            else {
                                console.log(`There was an error: No user found to update with SID: ${sessionIdentifier}`); // so how does it end up undefined, or even a different string entirely, here? when it's the same, why doesn't it work?
                                return response.status(500).json({ error: 'There was an error.' });
                            }
                        });
                    });
                }
                else {
                    return response.status(403).json({ error: 'User could not be authenticated.' });
                }
            });
        }
        else {
            return response.status(403).json({ error: 'Password or email is incorrect.' });
        }
    });
});
exports.default = router;
//# sourceMappingURL=signin.js.map