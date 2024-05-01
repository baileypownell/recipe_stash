"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ArrowBackIosRounded_1 = __importDefault(require("@mui/icons-material/ArrowBackIosRounded"));
const material_1 = require("@mui/material");
const react_router_1 = require("react-router");
const InnerNavigationBar = ({ title }) => {
    const theme = (0, material_1.useTheme)();
    const navigate = (0, react_router_1.useNavigate)();
    return ((0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", padding: 1, sx: {
            backgroundColor: theme.palette.secondary.main,
        }, color: theme.palette.info.main, children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "info", onClick: () => navigate('/recipes'), children: (0, jsx_runtime_1.jsx)(ArrowBackIosRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: title })] }));
};
exports.default = InnerNavigationBar;
//# sourceMappingURL=InnerNavigationBar.js.map