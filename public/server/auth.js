"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (request, response, _) => {
    if (request.session.userID) {
        const authState = {
            authenticated: true,
        };
        return response.status(200).json(authState);
    }
    else {
        const authState = {
            authenticated: false,
        };
        return response.status(200).json(authState);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map