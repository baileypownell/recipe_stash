const { Router } = require('express');
const pool = require('../db');
const router = Router();

// connecting to heroku db
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

router.get('/:email', (request, response, next) => {
  const {email } = request.params;
  client.query('SELECT * FROM users WHERE email=$1',
  [email],
  (err, res) => {
    if (err) return next(err);
    response.send(res)
  });
})

module.exports = router;
