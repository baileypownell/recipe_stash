const { Router } = require('express');
const pool = require('../db');

// connecting to heroku db
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

const router = Router();

router.delete('/:id', (request, response, next) => {
  const { id } = request.params;
    client.query('DELETE FROM recipes WHERE user_id=$1',
    [id],
     (err, res) => {
      if (err) {
        return next(err);
      }
      if (res) {
        console.log(res)
        return response.json({success: "true"})
      } else {
        return response.json({success: false, message: 'could not delete'})
      }
    });
})

module.exports = router;
