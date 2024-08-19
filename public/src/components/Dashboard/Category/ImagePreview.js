"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePreview = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_hook_form_1 = require("react-hook-form");
const DeleteRounded_1 = __importDefault(require("@mui/icons-material/DeleteRounded"));
const ImagePreview = ({ item, control, index, onChange, remove, backgroundImageUrl, }) => {
    const theme = (0, material_1.useTheme)();
    const filePreviewStyles = {
        boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
        flexGrow: 1,
        position: 'relative',
        height: '200px',
        minWidth: '200px',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        borderRadius: '5px',
        margin: '5px',
    };
    const fileCoverStyles = {
        position: 'absolute',
        backgroundColor: 'rgba(331, 68, 68, 0.2)',
        color: 'white',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        padding: '5px',
        transition: 'backgroundColor 0.4s',
        borderRadius: '5px',
    };
    return ((0, jsx_runtime_1.jsx)(react_hook_form_1.Controller, { name: `files.${index}`, control: control, render: () => {
            return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: filePreviewStyles, style: {
                    backgroundImage: `url(${backgroundImageUrl})`,
                }, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: fileCoverStyles, children: [(0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { value: "end", control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { onChange: onChange, checked: item.isDefault, inputProps: { 'aria-label': 'primary checkbox' } }), label: "Use as tile background image", labelPlacement: "end" }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "info", onClick: () => remove(index), sx: {
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                            }, children: (0, jsx_runtime_1.jsx)(DeleteRounded_1.default, {}) })] }) }));
        } }, item.id));
};
exports.ImagePreview = ImagePreview;
//# sourceMappingURL=ImagePreview.js.map