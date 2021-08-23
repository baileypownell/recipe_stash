import { Router } from 'express'

// const signin = require('./signin')
import signin from './signin'
// const sendResetEmail = require('./sendResetEmail')
import sendResetEmail from './sendResetEmail'
import signinWithGoogle from './signinWithGoogle'
import logout from './logout'
// const user = require('./user.ts')
import user from './user'
// const recipe = require('./recipe.ts')
import recipe from './recipe'
import fileUpload from './file-upload'
import auth from './auth'
const router = Router()

// middleware

router.use('/signin', signin)
router.use('/send-reset-email', sendResetEmail)
router.use('/signin-with-google', signinWithGoogle)
router.use('/logout', logout)
router.use('/user', user)
router.use('/recipe', recipe)
router.use('/file-upload', fileUpload)
router.use('/auth', auth)

export default router

export { AuthenticationState } from './auth'
