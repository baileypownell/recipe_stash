const { Router } = require('express');
const client = require('../db');

const router = Router();

router.get('/', (request, response, next) => {
    request.session = null;
    console.log(request.session)
    return response.json({success: true })
});

module.exports = router;