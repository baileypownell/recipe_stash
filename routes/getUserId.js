const { Router } = require('express');
const client = require('../db');

const router = Router();

router.get('/', (request, response) => {
    console.log('request.sessionId = ', request.sessionID)
    console.log('request.session.userId = ', request.session.userId)
    return response.json({ userId: request.session.userId});
})


module.exports = router;