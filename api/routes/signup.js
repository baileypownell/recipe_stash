require('dotenv').config();
// needed for generating JWT

const { Router } = require('express');
const pool = require('../db');

const jwt = require('jsonwebtoken');
const router = Router();

router.post('/', (request, response, next) => {

  const { firstName, lastName, password, email } = request.body;
  pool.query('INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
  [firstName, lastName, password, email],
   (err, res) => {
    if (err) console(err);
  });
  // authenticate with JWT

  const user = {
    first_name: firstName,
    last_name: lastName
  };
  let accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  response.json({ accessToken: accessToken})
})

module.exports = router;
