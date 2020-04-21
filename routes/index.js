const { Router } = require('express');

const users = require('./users');
const recipes = require('./recipes');
const signin = require('./signin');
const sendResetEmail = require('./sendResetEmail');
const signinWithGoogle = require('./signinWithGoogle');

const router = Router();

// middleware\

router.use('/users', users);
router.use('/recipes', recipes);
router.use('/signin', signin);
router.use('/sendResetEmail', sendResetEmail);
router.use('/signinWithGoogle', signinWithGoogle);

module.exports = router;
