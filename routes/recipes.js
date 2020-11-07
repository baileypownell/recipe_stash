const { Router } = require('express');
const client = require('../db');
const router = Router();

router.get('/', (request, response, next) => {
  let id = request.session.userId;
  if (id) {
    client.query('SELECT * FROM recipes WHERE user_id=$1',
  [id],
   (err, res) => {
    if (err) return next(err);
    if (res.rows.length >= 0) {
        let responseObject = {
          breakfast: [], 
          lunch: [],
          dinner: [], 
          dessert: [],
          other: [], 
          side_dish: [],
          drinks: []
        }
        res.rows.forEach((recipe) => {
          if (recipe.category === 'Dinner') {
            responseObject.dinner.push(recipe)
          } else if (recipe.category === 'Dessert') {
            responseObject.dessert.push(recipe)
          } else if (recipe.category === 'Drinks') {
            responseObject.drinks.push(recipe)
          } else if (recipe.category === 'Lunch') {
            responseObject.lunch.push(recipe)
          } else if (recipe.category === 'Breakfast') {
            responseObject.breakfast.push(recipe)
          } else if (recipe.category === 'Other') {
            responseObject.other.push(recipe)
          } else if (recipe.category === 'Side Dish') {
            responseObject.side_dish.push(recipe)
          }
        });
        response.json(responseObject);
      } 
    });
  } else {
    return response.status(403).send('No session on the server.')
  }
});

router.post('/', (request, response, next) => {
  const { title, category, ingredients, directions, isNoBake, isEasy, isHealthy, isGlutenFree, isDairyFree, isSugarFree, isVegetarian, isVegan, isKeto } = request.body;
  
  let userId = request.session.userId;
  client.query('INSERT INTO recipes(title, category, user_id, ingredients, directions, no_bake, easy, healthy, gluten_free, dairy_free, sugar_free, vegetarian, vegan, keto) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
  [title, category, userId, ingredients, directions, isNoBake, isEasy, isHealthy, isGlutenFree, isDairyFree, isSugarFree, isVegetarian, isVegan, isKeto],
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
  const { recipeId, title, ingredients, directions, category, isNoBake, isEasy, isHealthy, isGlutenFree, isDairyFree, isSugarFree, isVegetarian, isVegan, isKeto } = request.body;
  client.query('UPDATE recipes SET title=$1, ingredients=$2, directions=$3, category=$4, no_bake=$5, easy=$6, healthy=$7, gluten_free=$8, dairy_free=$9, sugar_free=$10, vegetarian=$11, vegan=$12, keto=$13 WHERE id=$14',
  [title, ingredients, directions, category, isNoBake, isEasy, isHealthy, isGlutenFree, isDairyFree, isSugarFree, isVegetarian, isVegan, isKeto, recipeId],
   (err, res) => {
    if (err) {
      return next(err);
    }
    if (res) {
      return response.status(200).json({success: true})
    } else {
      return response.status(500).json({success: false, message: 'Could not update recipe.'})
    }
  });
});


module.exports = router;
