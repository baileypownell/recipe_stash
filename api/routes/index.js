const { Router } = require('express');

const users = require('./users');
const recipes = require('./recipes');
const signup = require('./signup');

const router = Router();

// middleware
router.use('/users', users);
router.use('/recipes', recipes);
router.use('/signup', signup);

module.exports = router;
