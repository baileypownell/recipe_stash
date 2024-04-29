"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const App_1 = require("../components/App");
const AuthenticationService = {
    setUserLoggedIn: () => {
        window.localStorage.setItem('user_logged_in', 'true');
    },
    setUserLoggedOut: () => {
        window.localStorage.removeItem('user_logged_in');
    },
    authenticated: () => {
        return !!window.localStorage.getItem('user_logged_in');
    },
    verifyUserSession: async () => {
        return await axios_1.default.get('/auth');
    },
    signInWithGoogle: async (tokenId) => {
        return await axios_1.default.post('/signin-with-google', {
            token: tokenId,
        });
    },
    signIn: async (password, email) => {
        return await axios_1.default.post('/signin', {
            password,
            email,
        });
    },
    logout: async () => {
        App_1.queryClient.clear();
        return await axios_1.default.get('/logout');
    },
    getPasswordResetLink: async (email) => {
        return await axios_1.default.post('/send-reset-email', { email });
    },
    updatePassword: async (password, token, email) => {
        const updatePasswordResult = await axios_1.default.put('/user/reset-password', {
            password,
            reset_password_token: token,
        });
        const res = await AuthenticationService.signIn(password, email);
        if (res.data.success) {
            AuthenticationService.setUserLoggedIn();
        }
        return updatePasswordResult;
    },
    verifyEmailResetToken: async (token) => {
        return await axios_1.default.get(`/send-reset-email/${token}`);
    },
};
exports.default = AuthenticationService;
//# sourceMappingURL=auth-service.js.map