const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.put('/', (request, response, next) => {
  const { email, first_name, last_name, id } = request.body;
  if (email) {
    pool.query('UPDATE users SET email=$1 WHERE id=$2',
    [email, id],
     (err, res) => {
      if (err) {
        return next(err);
      }
      if (res) {
        return response.json({res})
      } else {
        return response.json({success: false, message: 'could not update DB'})
      }
    });
  } else if (first_name && last_name) {
    pool.query('UPDATE users SET first_name=$1, last_name=$2 WHERE id=$3',
    [first_name, last_name, id],
     (err, res) => {
      if (err) {
        return next(err);
      }
      if (res) {
        return response.json({res})
      } else {
        return response.json({success: false, message: 'could not update DB'})
      }
    });
  }

})

module.exports = router;
