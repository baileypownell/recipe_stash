"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const FilterListRounded_1 = __importDefault(require("@mui/icons-material/FilterListRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
function FilterMenu(props) {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const theme = (0, material_1.useTheme)();
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { sx: {
                    backgroundColor: 'white',
                    color: theme.palette.gray.main,
                    '&:hover': {
                        backgroundColor: 'white',
                    },
                }, "aria-controls": "menu", "aria-haspopup": "true", onClick: handleClick, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: { marginRight: '20px' }, children: "Filter" }), props.numberOfSelectedFilters > 0 ? ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: ["(", props.numberOfSelectedFilters, ")"] })) : ((0, jsx_runtime_1.jsx)(FilterListRounded_1.default, {}))] }) }), (0, jsx_runtime_1.jsx)(material_1.Menu, { id: "menu", anchorEl: anchorEl, keepMounted: true, open: Boolean(anchorEl), onClose: handleClose, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 2, minWidth: "200px", children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Stack, { padding: "10px", direction: "row", justifyContent: "space-between", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold', padding: '0!important' }, children: "Features" }), (0, jsx_runtime_1.jsx)(FilterListRounded_1.default, {})] }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), props.filters.map((item, index) => {
                                    return ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { sx: {
                                            paddingRight: 0,
                                        }, onClick: () => props.filter(item.key), children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { justifyContent: "space-between", alignItems: "center", direction: "row", width: "100%", children: [item.name, (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: props.appliedFilt[item.key], id: item.key, color: "orange", inputProps: { 'aria-label': 'primary checkbox' } })] }) }, index));
                                })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Stack, { padding: "10px", direction: "row", justifyContent: "space-between", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold', padding: '0!important' }, children: "Categories" }), (0, jsx_runtime_1.jsx)(FilterListRounded_1.default, {})] }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), props.categories.map((item, index) => {
                                    return ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { sx: {
                                            paddingRight: 0,
                                        }, onClick: () => props.filterByCategory(item.key), children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { justifyContent: "space-between", alignItems: "center", direction: "row", width: "100%", children: [item.name, (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: props.appliedCat[item.key], id: item.key, color: "orange", inputProps: { 'aria-label': 'primary checkbox' } })] }) }, index));
                                })] })] }) })] }));
}
exports.default = FilterMenu;
//# sourceMappingURL=FilterMenu.js.map