const { Router } = require('express');
const client = require('../db');
const router = Router();

// this endpoint is vulnerable...
router.post('/', (request, response, next) => {
  const { email } = request.body;
  console.log('current session = ', request.session)
  if (!email) {
    return response.json({success: false, message: 'Insufficient or invalid credentials provided.'})
  }
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err)  return next(err)
      if (res.rows.length) {
        let first_name, last_name, id;
        first_name = res.rows[0].first_name;
        last_name = res.rows[0].last_name;
        id = res.rows[0].id;
        request.session.regenerate(() => {
          request.session.userId = id;
          request.session.save();
          return response.json({
            id: id,
            first_name: first_name,
            last_name: last_name,
            email: email
          })
        })
      } else {
        return response.status(403).json({success: false, message: 'No user could be found with that address.'})
      }
  })
})

module.exports = router;
