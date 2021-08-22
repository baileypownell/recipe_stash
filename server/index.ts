import { Router } from 'express'

const signin = require('./signin')
const sendResetEmail = require('./sendResetEmail')
const signinWithGoogle = require('./signinWithGoogle')
const logout = require('./logout')
// const user = require('./user.ts')
import user from './user'
// const recipe = require('./recipe.ts')
import recipe from './recipe'
const fileUpload  = require('./file-upload')
const auth = require('./auth')
const router = Router();

// middleware

router.use('/signin', signin)
router.use('/send-reset-email', sendResetEmail)
router.use('/signin-with-google', signinWithGoogle)
router.use('/logout', logout)
router.use('/user', user)
router.use('/recipe', recipe)
router.use('/file-upload', fileUpload)
router.use('/auth', auth)

module.exports = router
