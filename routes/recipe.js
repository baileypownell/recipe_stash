const { Router } = require('express');
const client = require('../db');
const router = Router();

router.get('/:recipeId', (request, response, next) => {
    const { recipeId } = request.params;
    let id = request.session.userId;
    client.query('SELECT * FROM recipes WHERE user_id=$1 AND id=$2',
    [id, recipeId],
     (err, res) => {
      if (err) return next(err);
      response.status(200).json(res.rows)
    });
  });

router.put('/:recipeId', (request, response, next) => {
    const { recipeId } = request.params;
    const { category } = request.body;
    let id = request.session.userId;
    if (id) {
      client.query('UPDATE recipes SET category=$1 WHERE id=$2',
        [category, recipeId],
        (err, res) => {
          if (err) {
            return next(err);
          }
          if (res) {
            return response.status(200).json({success: true})
          } else {
            return response.status(500).json({success: false, message: 'could not update DB'})
          }
      })
    } else {
      return response.status(401).json({error: true, message: 'You are not authenticated.'})
    }  
});


router.delete('/:recipeId', (request, response, next) => {
    const { recipeId } = request.params;
    client.query('DELETE FROM recipes WHERE id=$1',
    [recipeId],
        (err, res) => {
        if (err) return next(err);
        if (res) {
        return response.status(200).json({success: true})
        } else {
        return response.status(500).json({success: false, message: 'could not delete from DB'})
        }
    });
});

module.exports = router;