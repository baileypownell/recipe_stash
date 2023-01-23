import { Router } from 'express';
import auth from './auth';
import fileUpload from './file-upload';
import logout from './logout';
import recipe from './recipe';
import sendResetEmail from './sendResetEmail';
import signin from './signin';
import signinWithGoogle from './signinWithGoogle';
import user from './user';

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

export { AuthenticationState } from './auth';
