const { Router } = require('express');
const client = require('../db');
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
