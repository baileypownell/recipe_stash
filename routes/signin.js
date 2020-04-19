const { Router } = require('express');
//const pool = require('../db');
const bcrypt = require('bcryptjs');
const router = Router();

// connecting to heroku db
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

router.post('/', (request, response, next) => {
  const { password, email } = request.body;
  // if user gets this far they are already verified to exist in the DB
  // compare plain text password to the hashed password in the DB
  let hashedPassword;
  client.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err) return next(err);
      let first_name, last_name, id;
      first_name = res.rows[0].first_name;
      last_name = res.rows[0].last_name;
      id = res.rows[0].id;
      let hashedPassword = res.rows[0].password;
      bcrypt.compare(password, hashedPassword, (err, res) => {
        if (err) {
          return next(err);
        }
        if (res) {
          // send back email, first name, last name, and user id by using information in above query;
          return response.json({
            id: id,
            first_name: first_name,
            last_name: last_name,
            email: email
          })
        } else {
          return response.json({success: false, message: 'passwords do not match'})
        }
      })
    })
})

module.exports = router;
