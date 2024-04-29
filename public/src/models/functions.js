"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPasswordValid = void 0;
// password must be at least 8 digits long, with at least one uppercase, one lowercase, and one digit
// (?=.*\d)(?=.*[a-z])(?=.*[A-Z])
const isPasswordValid = (password) => {
    if ((password?.length !== undefined && password?.length < 8) ||
        !/([A-Z]+)/g.test(password) ||
        !/([a-z]+)/g.test(password) ||
        !/([0-9]+)/g.test(password)) {
        return false;
    }
    else {
        return true;
    }
};
exports.isPasswordValid = isPasswordValid;
//# sourceMappingURL=functions.js.map