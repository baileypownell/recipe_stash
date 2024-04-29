"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryClient = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_query_1 = require("react-query");
const react_router_dom_1 = require("react-router-dom");
const auth_service_1 = __importDefault(require("../services/auth-service"));
const ErrorBoundary_1 = __importDefault(require("./ErrorBoundary"));
const GuardedRoute_1 = __importDefault(require("./GuardedRoute"));
require("./index.scss");
const RecipeCache_1 = __importDefault(require("./RecipeCache"));
const theme_1 = require("./theme");
const Nav_1 = __importDefault(require("./Nav"));
const Home_1 = __importDefault(require("./Home"));
const Login_1 = __importDefault(require("./Login"));
const Signup_1 = __importDefault(require("./Signup"));
const ResetPassword_1 = __importDefault(require("./ResetPassword"));
const Settings_1 = __importDefault(require("./Settings"));
exports.queryClient = new react_query_1.QueryClient();
const App = () => {
    const [authStateVerified, setAuthStateVerified] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        auth_service_1.default.verifyUserSession()
            .then((res) => {
            res.data.authenticated
                ? auth_service_1.default.setUserLoggedIn()
                : auth_service_1.default.setUserLoggedOut();
        })
            .catch((err) => console.log(err))
            .finally(() => setAuthStateVerified(true));
    }, []);
    if (!authStateVerified) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, { client: exports.queryClient, children: (0, jsx_runtime_1.jsx)(material_1.ThemeProvider, { theme: theme_1.theme, children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.BrowserRouter, { children: [(0, jsx_runtime_1.jsx)(Nav_1.default, {}), (0, jsx_runtime_1.jsx)(ErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Home_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/signup", element: (0, jsx_runtime_1.jsx)(Signup_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/reset/:token", element: (0, jsx_runtime_1.jsx)(ResetPassword_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/recipes", element: (0, jsx_runtime_1.jsx)(GuardedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(RecipeCache_1.default, {}) }), children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: ":id", element: (0, jsx_runtime_1.jsx)(GuardedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(RecipeCache_1.default, {}) }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/settings", element: (0, jsx_runtime_1.jsx)(GuardedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(Settings_1.default, {}) }) })] }) })] }) }) }));
};
exports.default = App;
//# sourceMappingURL=App.js.map