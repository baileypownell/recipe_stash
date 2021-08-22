"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = __importStar(require("express"));
const client_js_1 = __importDefault(require("./client.js"));
const router = Router.Router();
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_sendgrid_transport_1 = __importDefault(require("nodemailer-sendgrid-transport"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const authMiddleware_1 = require("./authMiddleware");
const { deleteAWSFiles } = require('./aws-s3');
const dotenv = __importStar(require("dotenv"));
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: __dirname + '/.env' });
}
router.get('/', authMiddleware_1.authMiddleware, (request, response, next) => {
    const userId = request.userID;
    client_js_1.default.query('SELECT email, first_name, last_name FROM users WHERE user_uuid=$1', [userId], (err, res) => {
        if (err)
            return next(err);
        if (res.rows.length) {
            const userData = {
                email: res.rows[0].email,
                firstName: res.rows[0].first_name,
                lastName: res.rows[0].last_name
            };
            response.status(200).json({
                success: true,
                userData
            });
        }
        else {
            response.status(500);
        }
    });
});
router.post('/', (request, response, next) => {
    const { firstName, lastName, password, email } = request.body;
    const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
    // make sure user doesn't already exist in the DB
    client_js_1.default.query('SELECT * FROM users WHERE email=$1', [email], (err, res) => {
        if (err)
            return next(err);
        if (res.rows.length >= 1) {
            return response.status(403).send({ error: 'An account already exists for this email.' });
        }
        else {
            // if user doesn't exist already, create them:
            client_js_1.default.query('INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)', [firstName, lastName, hashedPassword, email], (err, res) => {
                if (err)
                    return next(err);
                if (res) {
                    client_js_1.default.query('SELECT * FROM users WHERE email=$1', [email], (err, res) => {
                        if (err)
                            return next(err);
                        if (res.rows.length) {
                            const user_uuid = res.rows[0].user_uuid;
                            const email = res.rows[0].email;
                            const firstName = res.rows[0].first_name;
                            const lastName = res.rows[0].last_name;
                            request.session.regenerate(() => {
                                request.session.save();
                                // update the session table with the user's sessionID
                                client_js_1.default.query('UPDATE session SET user_uuid=$1 WHERE sid=$2', [user_uuid, request.sessionID], (err, res) => {
                                    if (err)
                                        return next(err);
                                    if (res.rowCount) {
                                        return response.status(201).json({
                                            success: true,
                                            message: 'User created',
                                            sessionID: request.sessionID,
                                            userData: {
                                                id: user_uuid,
                                                email,
                                                firstName,
                                                lastName
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    });
});
router.put('/reset-password', (request, response, next) => {
    const { reset_password_token, password } = request.body;
    if (password && reset_password_token) {
        client_js_1.default.query('SELECT * FROM users where reset_password_token=$1', [reset_password_token], (err, res) => {
            if (err)
                return next(err);
            if (res.rows.length) {
                // hash new password
                const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
                client_js_1.default.query('UPDATE users SET password=$1, reset_password_expires=$2, reset_password_token=$3 WHERE reset_password_token=$4', [hashedPassword, null, null, reset_password_token], (err, res) => {
                    if (err)
                        return next(err);
                    if (res) {
                        return response.status(200).json({ success: true, message: 'Password updated.' });
                    }
                    else {
                        return response.status(500).json({ success: false, message: 'Could not update password.' });
                    }
                });
            }
            else {
                return response.status(400).json({ success: false, message: 'Reset password token not found.' });
            }
        });
    }
});
router.put('/', authMiddleware_1.authMiddleware, (request, response, next) => {
    const { first_name, last_name, password, new_email } = request.body;
    const userId = request.userID;
    if (first_name && last_name) {
        client_js_1.default.query('UPDATE users SET first_name=$1, last_name=$2 WHERE user_uuid=$3', [first_name, last_name, userId], (err, res) => {
            if (err)
                return next(err);
            if (res.rows) {
                return response.status(200).json({ success: true });
            }
            else {
                return response.status(500).json({ success: false, message: 'User could not be updated.' });
            }
        });
    }
    if (new_email) {
        // make sure password is correct, if not, reject
        client_js_1.default.query('SELECT * FROM users WHERE user_uuid=$1', [userId], (err, res) => {
            if (err)
                return next(err);
            const hashedPassword = res.rows[0].password;
            const oldEmail = res.rows[0].email;
            bcryptjs_1.default.compare(password, hashedPassword, (err, res) => {
                if (err)
                    return next(err);
                if (res) {
                    // update record in DB
                    // but first ensure it is unique!
                    client_js_1.default.query('SELECT * FROM users WHERE email=$1', [new_email], (err, res) => {
                        if (err)
                            return next(err);
                        if (res.rows.length) {
                            return response.status(200).json({
                                success: false,
                                message: 'Email is not unique.'
                            });
                        }
                        else {
                            client_js_1.default.query('UPDATE users SET email=$1 WHERE user_uuid=$2', [new_email, userId], (err, res) => {
                                if (err)
                                    return next(err);
                                if (res) {
                                    // then send notification to the old email
                                    const options = {
                                        auth: {
                                            api_key: `${process.env.SENDGRID_API_KEY}`
                                        }
                                    };
                                    const mailer = nodemailer_1.default.createTransport(nodemailer_sendgrid_transport_1.default(options));
                                    const email = {
                                        from: 'virtualcookbook@outlook.com',
                                        to: `${oldEmail}`,
                                        subject: 'Your Email Address Has Been Changed',
                                        html: `<h1>recipe stash</h1><p>The email address for your recipe stash account has been recently updated. This message is just to inform you of this update for security purposes; you do not need to take any action.</p> \n\n <p>Next time you login, you'll need to use your updated email address.\n</p>`
                                    };
                                    mailer.sendMail(email, function (err, _) {
                                        if (err) {
                                            response.status(500).json({ success: false, message: 'There was an error sending the email.' });
                                        }
                                        else {
                                            return response.status(200).json({
                                                success: true,
                                                message: 'Email successfully updated.'
                                            });
                                        }
                                    });
                                }
                                ;
                            });
                        }
                    });
                }
                else {
                    return response.status(403).json({
                        success: false,
                        message: 'There was an error.'
                    });
                }
            });
        });
    }
});
router.delete('/', authMiddleware_1.authMiddleware, (request, response, next) => {
    const id = request.userID;
    client_js_1.default.query('SELECT key FROM files WHERE user_uuid=$1', [id], async (err, res) => {
        if (err)
            return next(err);
        if (res.rows.length) {
            const awsKeys = res.rows.map(val => val.key);
            try {
                const awsDeletions = await deleteAWSFiles(awsKeys);
                if (awsDeletions) {
                    client_js_1.default.query('DELETE FROM users WHERE user_uuid=$1', [id], (err, res) => {
                        if (err)
                            return next(err);
                        if (res) {
                            return response.status(200).json({ success: true });
                        }
                        else {
                            return response.status(500);
                        }
                    });
                }
                else {
                    return response.status(500).json({ success: false, message: 'Could not delete user files.' });
                }
            }
            catch (err) {
                return response.status(500).json({ success: false, message: err });
            }
        }
        else {
            client_js_1.default.query('DELETE FROM users WHERE user_uuid=$1', [id], (err, res) => {
                if (err)
                    return next(err);
                if (res) {
                    return response.status(200).json({ success: true });
                }
                else {
                    return response.status(500);
                }
            });
        }
    });
});
module.exports = router;
//# sourceMappingURL=user.js.map