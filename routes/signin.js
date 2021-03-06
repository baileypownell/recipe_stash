const { Router } = require('express')
const client = require('../db')
const bcrypt = require('bcryptjs')
const router = Router()

router.post('/', (request, response, next) => {
  const { password, email } = request.body
  if (!password || !email) {
    return response.status(400).json({success: false, message: 'Insufficient or invalid credentials provided.'})
  }
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err) return next(err)
      if (res.rows.length) {
        let first_name, last_name, id;
        first_name = res.rows[0].first_name;
        last_name = res.rows[0].last_name;
        id = res.rows[0].id;
        let hashedPassword = res.rows[0].password;
        bcrypt.compare(password, hashedPassword, (err, res) => {
          if (err) return next(err)
          if (res) {
              request.session.regenerate(() => {
                request.session.save()
                // update the session table with the user's sessionID 
                client.query('UPDATE session SET user_id=$1 WHERE sid=$2',
                [id, request.sessionID],
                (err, res) => {
                  if (err) return next(err)
                  if (res.rowCount) {
                    console.log(request.sessionID)
                    return response.status(200).json({
                      success: true,
                      sessionID: request.sessionID,
                      userData: {
                        id: id,
                        first_name: first_name,
                        last_name: last_name,
                        email: email
                      }
                    })
                  }
                })
              })
          } else {
            return response.status(403).json({error: 'User could not be authenticated'})
          }
        })
      } else {
        return response.status(403).json({error: 'No user exists with that email address.'})
      }
    })
})

module.exports = router;
