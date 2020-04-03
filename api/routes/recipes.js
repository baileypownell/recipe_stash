const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', (request, response, next) => {
  // pool.query('SELECT * FROM users', (err, res) => {
  //   if (err) return next(err);
  //   response.json(res.rows)
  // });
  console.log('you hit the recipes endpoint!');
  response.json({recipe: 'Baklava'})
});

module.exports = router;
