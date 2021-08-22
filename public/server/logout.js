"use strict";
const { Router } = require('express');
const router = Router();
router.get('/', (request, response, next) => {
    request.session.regenerate(() => {
        return response.status(200).json({ success: true });
    });
});
module.exports = router;
//# sourceMappingURL=logout.js.map