const { Router } = require('express')
const client = require('../db')
const router = Router()
const jwt_decode = require('jwt-decode')

router.post('/', (request, response, next) => {
  const { token } = request.body
  if (!token) {
    return response.status(400).json({success: false, message: 'Insufficient or invalid credentials provided.'})
  }
  let decodedToken = jwt_decode(token)
  client.query('SELECT * FROM users WHERE email=$1',
    [decodedToken.email],
    (err, res) => {
      if (err) return next(err)
      if (res.rows.length) {
        id = res.rows[0].id;
        // request.session.regenerate(() => {
        //   request.session.userId = id;
        //   request.session.save();
        //   return response.status(200).json({ success: true })
        // })
        // new 
        request.session.regenerate(() => {
          request.session.save()
          // update the session table with the user's sessionID 
          client.query('UPDATE session SET user_id=$1 WHERE sid=$2',
          [id, request.sessionID],
          (err, res) => {
            if (err) return next(err)
            if (res.rowCount) {
              return response.status(200).json({ success: true })
            }
          })
        })
      } else {
        return response.status(404)
      }
  })
})

module.exports = router;
