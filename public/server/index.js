"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signin = require('./signin');
const sendResetEmail = require('./sendResetEmail');
const signinWithGoogle = require('./signinWithGoogle');
const logout = require('./logout');
// const user = require('./user.ts')
const user_1 = __importDefault(require("./user"));
// const recipe = require('./recipe.ts')
const recipe_1 = __importDefault(require("./recipe"));
const fileUpload = require('./file-upload');
const auth = require('./auth');
const router = express_1.Router();
// middleware
router.use('/signin', signin);
router.use('/send-reset-email', sendResetEmail);
router.use('/signin-with-google', signinWithGoogle);
router.use('/logout', logout);
router.use('/user', user_1.default);
router.use('/recipe', recipe_1.default);
router.use('/file-upload', fileUpload);
router.use('/auth', auth);
module.exports = router;
//# sourceMappingURL=index.js.map