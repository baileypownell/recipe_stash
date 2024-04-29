"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const auth_service_1 = __importDefault(require("./auth-service"));
const UserService = {
    getUser: async () => {
        const user = await axios_1.default.get('/user');
        return user.data.userData;
    },
    updateUser: async (payload) => {
        return await axios_1.default.put('/user', payload);
    },
    deleteUser: async () => {
        const deletion = await axios_1.default.delete('/user');
        auth_service_1.default.setUserLoggedOut();
        return deletion.data;
    },
    createUser: async (userInput) => {
        const newUser = await axios_1.default.post('/user', userInput);
        return newUser.data;
    },
};
exports.default = UserService;
//# sourceMappingURL=user-service.js.map