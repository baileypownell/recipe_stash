"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (request, response) => {
    request.session.destroy();
    return response.status(200).json({ success: true });
});
exports.default = router;
//# sourceMappingURL=logout.js.map