import { Router } from 'express';
import auth from './auth.js';
import fileUpload from './file-upload.js';
import logout from './logout.js';
import recipe from './recipe.js';
import sendResetEmail from './sendResetEmail.js';
import signin from './signin.js';
import signinWithGoogle from './signinWithGoogle.js';
import user from './user.js';

const router = Router();

router.use('/signin', signin);
router.use('/send-reset-email', sendResetEmail);
router.use('/signin-with-google', signinWithGoogle);
router.use('/logout', logout);
router.use('/user', user);
router.use('/recipe', recipe);
router.use('/file-upload', fileUpload);
router.use('/auth', auth);

export default router;
