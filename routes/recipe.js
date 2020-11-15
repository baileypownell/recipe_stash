const { Router } = require('express');
const client = require('../db');
const router = Router();

const constructTags = (recipe) => {
  let tagArray = []
    if (recipe.no_bake) {
      tagArray.push("no_bake")
    }
    if (recipe.easy) {
      tagArray.push("easy")
    }
    if (recipe.healthy) {
      tagArray.push('healthy')
    }
    if (recipe.gluten_free) {
      tagArray.push('gluten_free')
    }
    if (recipe.dairy_free) {
      tagArray.push('dairy_free')
    }
    if (recipe.vegetarian) {
      tagArray.push('vegetarian')
    }
    if (recipe.vegan) {
      tagArray.push('vegan')
    }
    if (recipe.keto) {
      tagArray.push('keto')
    }
    if (recipe.sugar_free) {
      tagArray.push('sugar_free')
    }
    return tagArray
}

router.get('/:recipeId', (request, response, next) => {
    const { recipeId } = request.params;
    let id = request.session.userId;
    client.query('SELECT * FROM recipes WHERE user_id=$1 AND id=$2',
    [id, recipeId],
     (err, res) => {
      if (err) return next(err);
      let recipe = res.rows[0]

      if (recipe) {
        let recipe_response = {
          id: recipe.id, 
          title: recipe.title, 
          category: recipe.category, 
          user_id: recipe.user_id, 
          ingredients: recipe.ingredients, 
          directions: recipe.directions, 
          tags: constructTags(recipe)
        }
        response.status(200).json(recipe_response)
      } else {
        response.status(500).json(res)
      }
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