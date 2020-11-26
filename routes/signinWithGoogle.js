const { Router } = require('express');
const client = require('../db');
const router = Router();

router.post('/', (request, response, next) => {
  const { email, tokenId, googleId } = request.body;
  if (!email || !tokenId || !googleId) {
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
