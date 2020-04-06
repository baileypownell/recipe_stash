require('dotenv').config();
// needed for generating JWT

const { Router } = require('express');
const pool = require('../db');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = Router();

router.post('/', (request, response, next) => {
  const { password, email } = request.body;
  // if user gets this far they are already verified to exist in the DB
  // compare plain text password to the hashed password in the DB
  let hashedPassword;
  pool.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, res) => {
      if (err) return next(err);
      let hashedPassword = res.rows[0].password;
      bcrypt.compare(password, hashedPassword, (err, res) => {
        if (err) {
          return next(err);
        }
        if (res) {
          return response.json({email: email})
        } else {
          return response.json({success: false, message: 'passwords do not match'})
        }
      })
    })
})

module.exports = router;
