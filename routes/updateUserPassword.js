const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.put('/', (request, response, next) => {
  const { password, id } = request.body;
  console.log(password)
  pool.query('UPDATE users SET password=$1, reset_password_expires=$2, reset_password_token=$3 WHERE id=$4',
    [password, null, null, id],
     (err, res) => {
      if (err) {
        return next(err);
      }
      if (res) {
        console.log(res)
        return response.json({success: true})
      } else {
        return response.json({success: false, message: 'could not update DB'})
      }
    });
})

module.exports = router;
