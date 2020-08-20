const { Router } = require('express');
const client = require('../db');

const router = Router();

router.get('/', (request, response, next) => {
    //request.sesssion.destroy(() => console.log('the session should be gone'))
    // create new session without old data 
    request.session.regenerate()
    return response.json({success: true })
});

module.exports = router;