"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MobileRecipeToolbar;
const jsx_runtime_1 = require("react/jsx-runtime");
const MoreVertRounded_1 = __importDefault(require("@mui/icons-material/MoreVertRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
function MobileRecipeToolbar({ width, triggerDialog, cloneRecipe, }) {
    const theme = (0, material_1.useTheme)();
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleDialog = () => {
        handleClose();
        triggerDialog();
    };
    const duplicateRecipe = () => {
        handleClose();
        cloneRecipe();
    };
    return width <= 700 ? ((0, jsx_runtime_1.jsxs)(material_1.Box, { textAlign: "right", position: "absolute", bottom: "0", right: "0", left: "0", sx: {
            backgroundColor: theme.palette.gray.main,
        }, width: "100%", margin: "0", padding: "15px", zIndex: "1", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { "aria-controls": "simple-menu", "aria-haspopup": "true", onClick: handleClick, color: "info", children: (0, jsx_runtime_1.jsx)(MoreVertRounded_1.default, {}) }), (0, jsx_runtime_1.jsxs)(material_1.Menu, { anchorEl: anchorEl, keepMounted: true, open: Boolean(anchorEl), onClose: handleClose, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { onClick: handleDialog, children: "Edit" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { onClick: duplicateRecipe, children: "Duplicate" })] })] })) : null;
}
//# sourceMappingURL=MobileRecipeToolbar.js.map