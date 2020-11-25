const { Router } = require('express');
const client = require('../db');
const router = Router();

// this endpoint is vulnerable because using a tool like Postman or curl, you can authenticate a user with just their email address...
router.post('/', (request, response, next) => {
  console.log(response)
  console.log(request)
  const { email } = request.body;
  if (!email) {
    return response.json({success: false, message: 'Insufficient or invalid credentials provided.'})
  }
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err) return next(err)
      if (res.rows.length) {
        id = res.rows[0].id;
        request.session.regenerate(() => {
          request.session.userId = id;
          request.session.save();
          return response.status(200).json({ success: true })
        })
      } else {
        return response.status(200).json({success: false, message: 'No user could be found with that address.'})
      }
  })
})

module.exports = router;
