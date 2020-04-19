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

router.get('/', (request, response, next) => {
  client.query('SELECT * FROM users', (err, res) => {
    if (err) return next(err);
    response.json(res.rows)
  });
});

module.exports = router;
