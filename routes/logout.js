const { Router } = require('express');
const client = require('../db');

const router = Router();

router.get('/', (request, response, next) => {
    request.session.userId = null;
    return response.json({success: true })
});

module.exports = router;