"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const router = Router();
router.get('/', (request, response, _) => {
    request.session.regenerate(() => {
        return response.status(200).json({ success: true });
    });
});
exports.default = router;
// module.exports = router;
//# sourceMappingURL=logout.js.map