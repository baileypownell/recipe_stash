import { Router } from 'express'

import signin from './signin'
import sendResetEmail from './sendResetEmail'
import signinWithGoogle from './signinWithGoogle'
import logout from './logout'
import user from './user'
import recipe from './recipe'
import fileUpload from './file-upload'
import auth from './auth'
const router = Router()

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
