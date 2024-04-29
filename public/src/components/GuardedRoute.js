"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const auth_service_1 = __importDefault(require("../services/auth-service"));
const GuardedRoute = (props) => auth_service_1.default.authenticated() ? (props.children) : ((0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login" }));
exports.default = GuardedRoute;
//# sourceMappingURL=GuardedRoute.js.map