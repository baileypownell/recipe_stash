const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.put('/', (request, response, next) => {
  const { recipeId, title, ingredients, directions } = request.body;
  pool.query('UPDATE recipes SET title=$1, ingredients=$2, directions=$3 WHERE id=$4',
  [title, ingredients, directions, recipeId],
   (err, res) => {
    if (err) {
      return next(err);
    }
    if (res) {
      return response.json({success: true})
    } else {
      return response.json({success: false, message: 'could not update DB'})
    }
  });
})

module.exports = router;
