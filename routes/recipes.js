const { Router } = require('express');
const client = require('../db');
const router = Router();

router.get('/:id', (request, response, next) => {
  const { id } = request.params;
  client.query('SELECT * FROM recipes WHERE user_id=$1',
  [id],
   (err, res) => {
    if (err) return next(err);
    response.json(res.rows)
  });
});

// /specificRecipe/${this.props.userId}/${this.state.recipeId}

router.get('/:userId/:recipeId', (request, response, next) => {
  const { userId, recipeId } = request.params;
  client.query('SELECT * FROM recipes WHERE user_id=$1 AND id=$2',
  [userId, recipeId],
   (err, res) => {
    if (err) return next(err);
    response.status(200).json(res.rows)
  });
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

router.delete('/all/:id', (request, response, next) => {
  const { id } = request.params;
    client.query('DELETE FROM recipes WHERE user_id=$1',
    [id],
     (err, res) => {
      if (err) {
        return next(err);
      }
      if (res) {
        return response.status(200).json({success: "true"})
      } else {
        return response.status(500).json({success: false, message: 'could not delete'})
      }
    });
})

router.post('/', (request, response, next) => {
  const { title, category, ingredients, directions, user_id } = request.body;
  client.query('INSERT INTO recipes(title, category, user_id, ingredients, directions) VALUES($1, $2, $3, $4, $5)',
  [title, category, user_id, ingredients, directions],
   (err, res) => {
    if (err) {
      return next(err);
    }
    if (res) {
      if (res.rowCount === 1) {
        return response.status(200).json({success: true})
      }
    } else {
      return response.status(500).json({success: false, message: 'could not insert into DB'})
    }
  });
});

router.put('/', (request, response, next) => {
  const { recipeId, title, ingredients, directions } = request.body;
  client.query('UPDATE recipes SET title=$1, ingredients=$2, directions=$3 WHERE id=$4',
  [title, ingredients, directions, recipeId],
   (err, res) => {
    if (err) {
      return next(err);
    }
    if (res) {
      return response.status(200).json({success: true})
    } else {
      return response.status(500).json({success: false, message: 'could not update DB'})
    }
  });
});


module.exports = router;
