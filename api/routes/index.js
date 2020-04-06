const { Router } = require('express');

const users = require('./users');
const recipes = require('./recipes');
const signup = require('./signup');
const userByEmail = require('./userByEmail');

const router = Router();

// middleware
router.use('/users', users);
router.use('/recipes', recipes);
router.use('/signup', signup);
router.use('/userByEmail', userByEmail);

module.exports = router;