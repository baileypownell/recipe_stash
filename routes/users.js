const { Router } = require('express');
const client = require('../db');
const router = Router();

router.get('/', (request, response, next) => {
  client.query('SELECT * FROM users', (err, res) => {
    if (err) return next(err);
    response.json(res.rows)
  });
});

module.exports = router;
