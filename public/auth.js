"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const router = Router();
const client = require('./client');
router.get('/', (request, response, next) => {
    client.query('SELECT user_uuid FROM session WHERE sid=$1', [request.sessionID], (err, res) => {
        if (err)
            return next(err);
        if (res.rows.length && res.rows[0].user_uuid) {
            return response.status(200).json({ authenticated: true });
        }
        else {
            return response.status(200).json({ authenticated: false });
        }
    });
});
exports.default = router;
// module.exports = router;
//# sourceMappingURL=auth.js.map