"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadPreview = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const DeleteRounded_1 = __importDefault(require("@mui/icons-material/DeleteRounded"));
const FileUploadPreview = ({ defaultTileImageKey, fileIdentifier, setDefaultTileImage, removeFile, }) => {
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
    const determineCheckedState = (url) => {
        const key = url.split('amazonaws.com/')[1].split('?')[0];
        return key === defaultTileImageKey;
    };
    if (typeof fileIdentifier === 'string') {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: filePreviewStyles, style: {
                backgroundImage: `url(${fileIdentifier})`,
            }, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: fileCoverStyles, children: [(0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { value: "end", control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: determineCheckedState(fileIdentifier), id: fileIdentifier, onChange: (e) => setDefaultTileImage(e.target.checked
                                ? fileIdentifier.split('amazonaws.com/')[1].split('?')[0]
                                : null), inputProps: { 'aria-label': 'primary checkbox' } }), label: "Use as tile background image", labelPlacement: "end" }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "info", onClick: () => removeFile(fileIdentifier), sx: {
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                        }, children: (0, jsx_runtime_1.jsx)(DeleteRounded_1.default, {}) })] }) }, fileIdentifier));
    }
    else {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: filePreviewStyles, style: {
                backgroundImage: `url(${URL.createObjectURL(fileIdentifier.file)})`,
            }, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: fileCoverStyles, children: [(0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { value: "end", control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: fileIdentifier.id === defaultTileImageKey, id: fileIdentifier.id, onChange: (e) => setDefaultTileImage(e.target.checked ? fileIdentifier.id : null), inputProps: { 'aria-label': 'primary checkbox' } }), label: "Use as tile background image", labelPlacement: "end" }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "info", onClick: () => removeFile(fileIdentifier.id), sx: {
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                        }, children: (0, jsx_runtime_1.jsx)(DeleteRounded_1.default, {}) })] }) }, fileIdentifier.id));
    }
};
exports.FileUploadPreview = FileUploadPreview;
//# sourceMappingURL=FileUploadPreview.js.map