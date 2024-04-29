"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (request, response, next) => {
    if (request.session.isAuthenticated) {
        next();
    }
    else {
        request.session.error = 'Unauthenticated';
        return response.status(401).json({
            success: false,
            message: 'User unauthenticated',
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map