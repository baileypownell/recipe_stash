"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterMenu = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const FilterListRounded_1 = __importDefault(require("@mui/icons-material/FilterListRounded"));
const Clear_1 = __importDefault(require("@mui/icons-material/Clear"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const FilterMenu = ({ numberOfSelectedFilters, filters, categories, appliedFilt, appliedCat, filter, filterByCategory, clearFilters, }) => {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const open = Boolean(anchorEl);
    const theme = (0, material_1.useTheme)();
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { "aria-describedby": "filter-menu", onClick: handleClick, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: { marginRight: '5px' }, children: "Filter" }), numberOfSelectedFilters > 0 ? ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: ["(", numberOfSelectedFilters, ")"] })) : ((0, jsx_runtime_1.jsx)(FilterListRounded_1.default, {}))] }) }), (0, jsx_runtime_1.jsx)(material_1.Popover, { id: "filter-menu", anchorEl: anchorEl, keepMounted: true, open: open, onClose: handleClose, anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                }, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "column", alignItems: "center", paddingBottom: 1, paddingRight: 2, paddingLeft: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { minWidth: "150px", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", fontWeight: "bold", p: 1, children: "Tags" }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsx)(material_1.FormGroup, { children: filters.map((item) => {
                                                return ((0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { tabIndex: 0, checked: appliedFilt[item.key], onChange: () => filter(item.key) }), label: item.name }, item.name));
                                            }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { minWidth: "150px", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", fontWeight: "bold", p: 1, children: "Categories" }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsx)(material_1.FormGroup, { children: categories.map((item) => {
                                                return ((0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: appliedCat[item.key], id: item.key, onChange: () => filterByCategory(item.key) }), label: item.name }, item.name));
                                            }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { sx: {
                                svg: {
                                    color: theme.palette.primary.main,
                                },
                            }, onClick: clearFilters, size: "small", variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(Clear_1.default, {}), children: "Clear All" })] }) })] }));
};
exports.FilterMenu = FilterMenu;
exports.default = exports.FilterMenu;
//# sourceMappingURL=FilterMenu.js.map