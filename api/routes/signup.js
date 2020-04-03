const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', (request, response, next) => {
  // pool.query('SELECT * FROM users', (err, res) => {
  //   if (err) return next(err);
  //   response.json(res.rows)
  // });
  console.log('you hit the signup endpoint!');
  response.json({username: 'caleb'})
});

router.post('/', (request, response, next) => {
  console.log('hitting signup endpoint')
  // validate the payload
  const { firstName, lastName, password, email } = request.body;
  // ensure they don't already exist in the database
  // hash the password before storing
  pool.query('INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
  [firstName, lastName, password, email],
   (err, res) => {
    if (err) return next(err);
  });
  // once that is finished, redirect to the dashboard
  response.json(response.rows)
})

module.exports = router;
