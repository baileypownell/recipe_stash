const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.post('/', (request, response, next) => {

  const { title, category, ingredients, directions, user_id } = request.body;
  pool.query('INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES($1, $2, $3, $4, $5)',
  [title, category, user_id, ingredients, directions],
   (err, res) => {
    if (err) return next(err);
    if (res) {
      if (res.rowCount === 1) {
        return response.json({success: true})
      }
    } else {
      return response.json({success: false, message: 'could not insert into DB'})
    }
  });
})

module.exports = router;
