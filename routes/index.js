const { Router } = require('express')

const signin = require('./signin')
const sendResetEmail = require('./sendResetEmail')
const signinWithGoogle = require('./signinWithGoogle')
const logout = require('./logout')
const user = require('./user')
const recipe = require('./recipe')

const router = Router();

// middleware 

router.use('/signin', signin)
router.use('/sendResetEmail', sendResetEmail)
router.use('/signinWithGoogle', signinWithGoogle)
router.use('/logout', logout)
router.use('/user', user)
router.use('/recipe', recipe)

module.exports = router
