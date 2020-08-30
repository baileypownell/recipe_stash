const { Router } = require('express');
const client = require('../db');
const bcrypt = require('bcryptjs');
const router = Router();

const app = require('../server');


router.post('/', (request, response, next) => {
  const { password, email } = request.body;
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err)  {
        console.log(err)
        response.json(err);
        return next(err);
      }
      let first_name, last_name, id;
      first_name = res.rows[0].first_name;
      last_name = res.rows[0].last_name;
      id = res.rows[0].id;
      let hashedPassword = res.rows[0].password;
      bcrypt.compare(password, hashedPassword, (err, res) => {
        if (err) {
          console.log(err)
          return next(err);
        }
        if (res) {
          request.session.regenerate(() => {
            request.session.userId = id;
            request.session.save();
            return response.json({
              id: id,
              first_name: first_name,
              last_name: last_name,
               email: email
            })
          });
        } else {
          return response.json({success: false, message: 'Passwords do not match'})
        }
      })
    })
})

module.exports = router;
