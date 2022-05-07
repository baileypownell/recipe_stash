"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// const signin = require('./signin')
const signin_1 = __importDefault(require("./signin"));
// const sendResetEmail = require('./sendResetEmail')
const sendResetEmail_1 = __importDefault(require("./sendResetEmail"));
const signinWithGoogle_1 = __importDefault(require("./signinWithGoogle"));
const logout_1 = __importDefault(require("./logout"));
// const user = require('./user.ts')
const user_1 = __importDefault(require("./user"));
// const recipe = require('./recipe.ts')
const recipe_1 = __importDefault(require("./recipe"));
const file_upload_1 = __importDefault(require("./file-upload"));
const auth_1 = __importDefault(require("./auth"));
const router = (0, express_1.Router)();
// middleware
router.use('/signin', signin_1.default);
router.use('/send-reset-email', sendResetEmail_1.default);
router.use('/signin-with-google', signinWithGoogle_1.default);
router.use('/logout', logout_1.default);
router.use('/user', user_1.default);
router.use('/recipe', recipe_1.default);
router.use('/file-upload', file_upload_1.default);
router.use('/auth', auth_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map