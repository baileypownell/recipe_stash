"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const client_1 = __importDefault(require("./client"));
const authMiddleware = (req, response, next) => {
    if (req.sessionID) {
        // get user_id from req.sessionID
        client_1.default.query('SELECT user_uuid FROM session WHERE sid=$1', [req.sessionID], (err, res) => {
            if (err)
                return next(err);
            if (res.rows.length && res.rows[0].user_uuid) {
                req.userID = res.rows[0].user_uuid;
                next();
            }
            else {
                return response.status(401).json({ success: false, message: 'Access denied: No session for the user.' });
            }
        });
    }
    else {
        return response.status(401).json({ success: false, message: 'Access denied: No session for the user.' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map