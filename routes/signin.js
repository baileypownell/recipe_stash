const { Router } = require('express');
const client = require('../db');
const bcrypt = require('bcryptjs');
const router = Router();

router.post('/', (request, response, next) => {
  const { password, email } = request.body;
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err) return next(err)
      if (res.rows.length) {
        console.log(res)
        let first_name, last_name, id;
        first_name = res.rows[0].first_name;
        last_name = res.rows[0].last_name;
        id = res.rows[0].id;
        let hashedPassword = res.rows[0].password;
        bcrypt.compare(password, hashedPassword, (err, res) => {
          if (err) {
            console.log(err)
            return next(err)
          }
          if (res) {
              request.session.regenerate(() => {
              request.session.userId = id
              request.session.save()
              return response.status(200).json({
                success: true,
                userData: {
                  id: id,
                  first_name: first_name,
                  last_name: last_name,
                  email: email
                }
              })
            })
          } else {
            return response.json({success: false, message: 'User could not be authenticated'})
          }
        })
      } else {
        return response.json({success: false, message: 'No user exists with that email address.'})
      }

      
    })
})

module.exports = router;
