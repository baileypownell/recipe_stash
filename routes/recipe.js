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

const formatRecipeResponse = (recipe) => {
  return {
    id: recipe.id, 
    title: recipe.title, 
    category: recipe.category, 
    user_id: recipe.user_id, 
    ingredients: recipe.ingredients, 
    directions: recipe.directions, 
    tags: constructTags(recipe)
  }
}

router.get('/', (request, response, next) => {
  let userId = request.session.userId;
  if (!userId) {
    return response.status(403).json({success: false, message: 'Access denied: No session for the user.'})
  }
  client.query('SELECT * FROM recipes WHERE user_id=$1',
  [userId],
   (err, res) => {
    if (err) return next(err);
    let responseObject = {
      breakfast: [], 
      lunch: [],
      dinner: [], 
      dessert: [],
      other: [], 
      side_dish: [],
      drinks: []
    }
    if (res.rows.length) {
        res.rows.forEach((recipe) => {
          if (recipe.category === 'Dinner') {
            responseObject.dinner.push(formatRecipeResponse(recipe))
          } else if (recipe.category === 'Dessert') {
            responseObject.dessert.push(formatRecipeResponse(recipe))
          } else if (recipe.category === 'Drinks') {
            responseObject.drinks.push(formatRecipeResponse(recipe))
          } else if (recipe.category === 'Lunch') {
            responseObject.lunch.push(formatRecipeResponse(recipe))
          } else if (recipe.category === 'Breakfast') {
            responseObject.breakfast.push(formatRecipeResponse(recipe))
          } else if (recipe.category === 'Other') {
            responseObject.other.push(formatRecipeResponse(recipe))
          } else if (recipe.category === 'Side Dish') {
            responseObject.side_dish.push(formatRecipeResponse(recipe))
          }
        });
        response.json(responseObject);
    } else {
      return response.json(responseObject)
    } 
  })
})

router.post('/', (request, response, next) => {
  let userId = request.session.userId
  if (!userId) {
    return response.status(403).json({success: false, message: 'Access denied: No session for the user.'})
  }
  const { 
    title, 
    category, 
    ingredients, 
    directions, 
    isNoBake, 
    isEasy, 
    isHealthy, 
    isGlutenFree, 
    isDairyFree, 
    isSugarFree, 
    isVegetarian, 
    isVegan, 
    isKeto 
  } = request.body;
  if (title, 
    category, 
    ingredients, 
    directions, 
    isNoBake, 
    isEasy, 
    isHealthy, 
    isGlutenFree, 
    isDairyFree, 
    isSugarFree, 
    isVegetarian, 
    isVegan, 
    isKeto ) {
      client.query('INSERT INTO recipes(title, category, user_id, ingredients, directions, no_bake, easy, healthy, gluten_free, dairy_free, sugar_free, vegetarian, vegan, keto) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
        [title, category, userId, ingredients, directions, isNoBake, isEasy, isHealthy, isGlutenFree, isDairyFree, isSugarFree, isVegetarian, isVegan, isKeto],
        (err, res) => {
          if (err) return next(err)
          console.log(res)
          if (res.rowCount) {
            return response.status(200).json({ success: true, message: 'Recipe created.' })
          } else {
            return response.status(500).json({ success: false, message: 'Could not create recipe.' })
          }
        })
    } else {
      return response.status(403).json({
        success: false, 
        message: 'Invalid request sent.'
      })
    }
})

router.put('/', (request, response, next) => {
  let userId = request.session.userId
  if (!userId) {
    return response.status(403).json({success: false, message: 'Access denied: No session for the user.'})
  }
  const { recipeId, title, ingredients, directions, category, isNoBake, isEasy, isHealthy, isGlutenFree, isDairyFree, isSugarFree, isVegetarian, isVegan, isKeto } = request.body;
  client.query('UPDATE recipes SET title=$1, ingredients=$2, directions=$3, category=$4, no_bake=$5, easy=$6, healthy=$7, gluten_free=$8, dairy_free=$9, sugar_free=$10, vegetarian=$11, vegan=$12, keto=$13 WHERE id=$14 AND user_id=$15',
  [title, ingredients, directions, category, isNoBake, isEasy, isHealthy, isGlutenFree, isDairyFree, isSugarFree, isVegetarian, isVegan, isKeto, recipeId, userId],
   (err, res) => {
    if (err) return next(err)
    if (res.rowCount) {
      return response.status(200).json({success: true})
    } else {
      return response.status(500).json({success: false, message: 'Could not update recipe.'})
    }
  });
})

router.get('/:recipeId', (request, response, next) => {
    const { recipeId } = request.params;
    let userId = request.session.userId;
    if (!userId) {
      return response.status(403).json({success: false, message: 'Access denied: No session for the user.'})
    }
    client.query('SELECT * FROM recipes WHERE user_id=$1 AND id=$2',
    [userId, recipeId],
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
        response.status(200).json({ success: true, recipe: recipe_response })
      } else {
        response.status(500).json({ success: false, message: 'No recipe could be found.'})
      }
    })
  })

router.delete('/:recipeId', (request, response, next) => {
  let userId = request.session.userId
  if (!userId) {
    return response.status(403).json({success: false, message: 'Access denied: No session for the user.'})
  }
  const { recipeId } = request.params;
  client.query('DELETE FROM recipes WHERE id=$1 AND user_id=$2',
  [recipeId, userId],
      (err, res) => {
      if (err) return next(err);
      if (res) {
        return response.status(200).json({ success: true, message: 'Recipe deleted.' })
      } else {
        return response.status(500).json({success: false, message: 'Recipe not deleted.'})
      }
  })
})

module.exports = router;