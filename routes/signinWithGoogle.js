const { Router } = require('express')
const client = require('../db')
const router = Router()
const jwt_decode = require('jwt-decode')

router.post('/', (request, response, next) => {
  const { token } = request.body
  if (!token) {
    return response.json({success: false, message: 'Insufficient or invalid credentials provided.'})
  }
  let decodedToken = jwt_decode(token)
  client.query('SELECT * FROM users WHERE email=$1',
    [decodedToken.email],
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
