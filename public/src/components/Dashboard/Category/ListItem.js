"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_router_1 = require("react-router");
const ListItem = ({ recipeId, key, rawTitle }) => {
    const navigate = (0, react_router_1.useNavigate)();
    const theme = (0, material_1.useTheme)();
    const viewRecipe = () => navigate(`/recipes/${recipeId}`);
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { width: "100%", borderBottom: `1px solid ${theme.palette.gray.main}`, sx: {
            cursor: 'pointer',
        }, padding: 1, onClick: viewRecipe, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: rawTitle }) }, key));
};
exports.default = ListItem;
//# sourceMappingURL=ListItem.js.map