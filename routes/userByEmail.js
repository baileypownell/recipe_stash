const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/:email', (request, response, next) => {
  const {email } = request.params;
  pool.query('SELECT * FROM users WHERE email=$1',
  [email],
  (err, res) => {
    if (err) return next(err);
    response.send(res)
  });
})

module.exports = router;
