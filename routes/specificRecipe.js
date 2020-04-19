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

router.get('/:userId/:id', (request, response, next) => {
  const { id, userId } = request.params;
  client.query('SELECT * FROM recipes WHERE user_id=$1 AND id=$2',
  [userId, id],
   (err, res) => {
    if (err) return next(err);
    response.json(res.rows)
  });
});

module.exports = router;
