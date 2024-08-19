"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_router_1 = require("react-router");
const ListItem = ({ recipeId, key, rawTitle }) => {
    const navigate = (0, react_router_1.useNavigate)();
    const viewRecipe = () => navigate(`/recipes/${recipeId}`);
    return ((0, jsx_runtime_1.jsx)(material_1.ListItem, { dense: true, sx: {
            paddingLeft: 0,
        }, children: (0, jsx_runtime_1.jsx)(material_1.ListItemButton, { onClick: viewRecipe, children: (0, jsx_runtime_1.jsx)(material_1.ListItemText, { children: rawTitle }) }) }, key));
};
exports.default = ListItem;
//# sourceMappingURL=ListItem.js.map