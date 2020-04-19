const { Router } = require('express');
const client = require('../db');
const router = Router();

router.delete('/:recipe_id', (request, response, next) => {
  const { recipe_id } = request.params;
  client.query('DELETE FROM recipes WHERE id=$1',
  [recipe_id],
   (err, res) => {
    if (err) return next(err);
    if (res) {
      return response.json({success: true})
    } else {
      return response.json({success: false, message: 'could not delete from DB'})
    }
  });
})

module.exports = router;
