"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const HomeRounded_1 = __importDefault(require("@mui/icons-material/HomeRounded"));
const LoginRounded_1 = __importDefault(require("@mui/icons-material/LoginRounded"));
const LogoutRounded_1 = __importDefault(require("@mui/icons-material/LogoutRounded"));
const MenuRounded_1 = __importDefault(require("@mui/icons-material/MenuRounded"));
const PersonAddAltRounded_1 = __importDefault(require("@mui/icons-material/PersonAddAltRounded"));
const RestaurantRounded_1 = __importDefault(require("@mui/icons-material/RestaurantRounded"));
const SettingsApplicationsRounded_1 = __importDefault(require("@mui/icons-material/SettingsApplicationsRounded"));
const material_1 = require("@mui/material");
const system_1 = require("@mui/system");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const black_logo_png_1 = __importDefault(require("../images/black-logo.png"));
const white_logo_png_1 = __importDefault(require("../images/white-logo.png"));
const auth_service_1 = __importDefault(require("../services/auth-service"));
const Nav = () => {
    const [open, setOpen] = (0, react_1.useState)(false);
    const isAuthenticated = auth_service_1.default.authenticated();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const theme = (0, material_1.useTheme)();
    const logout = async () => {
        try {
            await auth_service_1.default.logout();
            auth_service_1.default.setUserLoggedOut();
            setOpen(false);
            navigate('/');
        }
        catch (err) {
            console.log(err);
        }
    };
    const handleListItemClick = (route) => {
        navigate(route);
        setOpen(false);
    };
    const toggleDrawer = (openState) => (event) => {
        if (event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setOpen(openState);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.AppBar, { position: "sticky", sx: { backgroundColor: theme.palette.gray.main }, children: (0, jsx_runtime_1.jsxs)(material_1.Toolbar, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "large", edge: "start", color: "inherit", "aria-label": "menu", sx: { mr: 2 }, onClick: toggleDrawer(!open), children: (0, jsx_runtime_1.jsx)(MenuRounded_1.default, {}) }), (0, jsx_runtime_1.jsxs)(system_1.Stack, { direction: "row", justifyContent: "space-between", width: "100%", children: [(0, jsx_runtime_1.jsx)("img", { src: black_logo_png_1.default, alt: "logo", style: { height: '35px' } }), isAuthenticated ? ((0, jsx_runtime_1.jsx)(material_1.Button, { color: "inherit", onClick: () => navigate('/recipes'), children: "Recipes" })) : ((0, jsx_runtime_1.jsx)(material_1.Button, { color: "inherit", onClick: () => navigate('/login'), children: "Login" }))] })] }) }), (0, jsx_runtime_1.jsx)(material_1.SwipeableDrawer, { anchor: "left", open: open, onClose: toggleDrawer(false), onOpen: toggleDrawer(true), children: (0, jsx_runtime_1.jsxs)(system_1.Stack, { width: "250px", paddingTop: "20px", children: [(0, jsx_runtime_1.jsx)("img", { style: { width: 'calc(100% - 20px)', margin: '0 auto 20px auto' }, src: white_logo_png_1.default, alt: "logo" }), (0, jsx_runtime_1.jsx)(material_1.List, { sx: {
                                '.MuiListItemText-primary': {
                                    color: theme.palette.gray.main,
                                },
                                svg: {
                                    color: theme.palette.gray.main,
                                },
                            }, children: isAuthenticated ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { onClick: () => handleListItemClick('/recipes'), children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(RestaurantRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "Recipes" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { onClick: () => handleListItemClick('/settings'), children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(SettingsApplicationsRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "Settings" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { onClick: () => handleListItemClick('/'), children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(HomeRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "Home" })] }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { onClick: logout, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(LogoutRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "Logout" })] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { onClick: () => handleListItemClick('/login'), children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(LoginRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "Login" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { onClick: () => handleListItemClick('/signup'), children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(PersonAddAltRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "Create Account" })] })] })) })] }) })] }));
};
exports.default = Nav;
//# sourceMappingURL=Nav.js.map