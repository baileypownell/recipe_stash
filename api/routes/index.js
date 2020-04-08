const { Router } = require('express');

const users = require('./users');
const recipes = require('./recipes');
const specificRecipe = require('./specificRecipe');
const signup = require('./signup');
const userByEmail = require('./userByEmail');
const signin = require('./signin');
const createRecipe = require('./createRecipe');
const deleteRecipe = require('./deleteRecipe');

const router = Router();

// middleware
router.use('/users', users);
router.use('/recipes', recipes);
router.use('/specificRecipe', specificRecipe);
router.use('/signup', signup);
router.use('/signin', signin);
router.use('/userByEmail', userByEmail);
router.use('/createRecipe', createRecipe);
router.use('/deleteRecipe', deleteRecipe);

module.exports = router;
