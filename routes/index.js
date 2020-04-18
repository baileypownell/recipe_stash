const { Router } = require('express');

const users = require('./users');
const recipes = require('./recipes');
const specificRecipe = require('./specificRecipe');
const signup = require('./signup');
const userByEmail = require('./userByEmail');
const signin = require('./signin');
const createRecipe = require('./createRecipe');
const deleteRecipe = require('./deleteRecipe');
const updateRecipe = require('./updateRecipe');
const updateProfile = require('./updateProfile');
const deleteAccount = require('./deleteAccount');
const deleteAllUserRecipes = require('./deleteAllUserRecipes');
const resetPassword = require('./resetPassword');
const updateUserPassword = require('./updateUserPassword');
const resetEmail = require('./resetEmail');

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
router.use('/updateRecipe', updateRecipe);
router.use('/updateProfile', updateProfile);
router.use('/deleteAccount', deleteAccount);
router.use('/deleteAllUserRecipes', deleteAllUserRecipes);
router.use('/resetPassword', resetPassword);
router.use('/updateUserPassword', updateUserPassword);
router.use('/resetEmail', resetEmail);

module.exports = router;
