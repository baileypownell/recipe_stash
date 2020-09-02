const { Router } = require('express');
const client = require('../db');
const router = Router();

router.get('/', (request, response, next) => {
  let userId = request.session.userId;
  client.query('SELECT * FROM users WHERE id=$1',
  [userId],
   (err, res) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (res.rows.length === 0) {
      response.status(403).send('No session found.')
    } else if (res.rows.length === 1) {
      response.status(200).json(res)
    }
  });
});

module.exports = router;