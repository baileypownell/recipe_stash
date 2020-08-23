const { Router } = require('express');
const client = require('../db');
const router = Router();

router.post('/', (request, response, next) => {
  const { email } = request.body;
  // if user gets this far they are already verified to exist in the DB
  // just return their information
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err)  {
        response.json(err);
        return next(err);
      }
      let first_name, last_name, id;
      first_name = res.rows[0].first_name;
      last_name = res.rows[0].last_name;
      id = res.rows[0].id;
      request.session.regenerate()
      request.session.userId = id;
      return response.json({
        id: id,
        first_name: first_name,
        last_name: last_name,
        email: email
      })
  })
})

module.exports = router;
