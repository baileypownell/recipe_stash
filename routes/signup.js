
// needed for generating JWT

const { Router } = require('express');
const pool = require('../db');
const router = Router();

router.post('/', (request, response, next) => {

  const { firstName, lastName, password, email } = request.body;
  pool.query('INSERT INTO users(first_name, last_name, password, email) VALUES($1, $2, $3, $4)',
  [firstName, lastName, password, email],
   (err, res) => {
    if (err) return next(err);
    if (res) {
      pool.query('SELECT * FROM users WHERE email=$1',
      [email],
    (err, res) => {
      if (err) {
        return next(err);
      }
      if (res) {
        let id=res.rows[0].id;
        return response.json({success: true, id: id})
      }
    })
    } else {
      return response.json({success: false, message: 'could not insert into DB'})
    }
  });
})

module.exports = router;
