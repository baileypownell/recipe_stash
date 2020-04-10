const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.delete('/:id', (request, response, next) => {
  const { id } = request.params;
    pool.query('DELETE FROM users WHERE id=$1',
    [id],
     (err, res) => {
      if (err) {
        return next(err);
      }
      if (res) {
        return response.json({success: "true"})
      } else {
        return response.json({success: false, message: 'could not update DB'})
      }
    });
})

module.exports = router;
