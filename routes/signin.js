const { Router } = require('express');
const client = require('../db');
const bcrypt = require('bcryptjs');
const router = Router();

const app = require('../server');


router.post('/', (request, response, next) => {
  //console.log('Session = ', request.session)
  const { password, email } = request.body;
  // if user gets this far they are already verified to exist in the DB
  // compare plain text password to the hashed password in the DB
  let hashedPassword;
  console.log('here')
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
          // send back email, first name, last name, and user id by using information in above query;
          // update session cookie 
          request.session.userId = id
          console.log(request.session.userId)
          // let's generate a sessionID for this user and store in the database? 
          let sessionid = app.use.session.genid
          console.log(sessionid)
          return response.json({
            id: id,
            first_name: first_name,
            last_name: last_name,
            email: email
          })
        } else {
          return response.json({success: false, message: 'Passwords do not match'})
        }
      })
    })
})

module.exports = router;
