"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const UploadFileRounded_1 = __importDefault(require("@mui/icons-material/UploadFileRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const FileUploadPreview_1 = require("./FileUploadPreview");
const { v4: uuidv4 } = require('uuid');
const FileUpload = ({ passDefaultTileImage, preExistingImageUrls, defaultTileImageUUID, passFiles, passFilesToDelete, }) => {
    const [files, setFiles] = (0, react_1.useState)([]);
    const [filesToDelete, setFilesToDelete] = (0, react_1.useState)([]);
    const [defaultTileImageKey, setDefaultTileImageKey] = (0, react_1.useState)(null);
    const [snackBarOpen, setSnackBarOpen] = (0, react_1.useState)(false);
    const [snackBarMessage, setSnackBarMessage] = (0, react_1.useState)('');
    const input = (0, react_1.useRef)(null);
    const theme = (0, material_1.useTheme)();
    (0, react_1.useEffect)(() => {
        if (defaultTileImageUUID) {
            setDefaultTileImageKey(defaultTileImageUUID);
        }
    }, []);
    const openFileFinder = () => {
        if (input.current)
            input.current.click();
    };
    const openSnackBar = (message) => {
        setSnackBarOpen(true);
        setSnackBarMessage(message);
    };
    const closeSnackBar = () => {
        setSnackBarOpen(false);
        setSnackBarMessage('');
    };
    const processfiles = (newFiles) => {
        const filesToProcess = Array.from(newFiles).slice(0, 5 - files.length);
        const maxReached = !!(files.length + (preExistingImageUrls?.length || 0) >=
            5);
        if (maxReached) {
            openSnackBar('Only 5 images allowed per recipe.');
            return;
        }
        const processedFiles = filesToProcess.map((file) => ({
            file: file,
            id: uuidv4(),
        }));
        setFiles([...files, ...processedFiles]);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fileList = e.dataTransfer.files;
        if (!fileList.length) {
            return;
        }
        processfiles(fileList);
    };
    const handleUpload = (e) => processfiles(e.target.files);
    const removeNewFile = (fileId) => {
        setFiles(files.filter((file) => file.id !== fileId));
    };
    const handleFileDeletion = (fileUrl) => {
        const imageKey = fileUrl.split('amazonaws.com/')[1].split('?')[0];
        const isDefaultTileImage = imageKey === defaultTileImageKey;
        if (isDefaultTileImage) {
            setDefaultTileImageKey(null);
        }
        setFilesToDelete([...filesToDelete, fileUrl]);
    };
    (0, react_1.useEffect)(() => {
        passFiles(files);
    }, [files]);
    (0, react_1.useEffect)(() => {
        passDefaultTileImage(defaultTileImageKey);
    }, [defaultTileImageKey]);
    (0, react_1.useEffect)(() => {
        passFilesToDelete?.(filesToDelete);
    }, [filesToDelete]);
    const limitReached = !!(files.length + (preExistingImageUrls?.length || 0) >=
        5);
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { padding: "20px 0", children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                    border: `2px dashed  ${theme.palette.boxShadow.main}`,
                    cursor: 'pointer',
                    position: 'relative',
                    input: {
                        display: 'block',
                        width: '100%',
                        opacity: 0,
                        position: 'absolute',
                        minHeight: '275px',
                    },
                }, onDrop: handleDrop, onDragOver: handleDrop, children: [(0, jsx_runtime_1.jsx)("input", { ref: input, type: "file", disabled: limitReached, onChange: handleUpload, multiple: true, title: "Upload a file" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '25px',
                            svg: {
                                fontSize: '100px',
                                marginTop: '15px',
                            },
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "overline", children: "Drag & drop an image" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "secondary", onClick: openFileFinder, disabled: limitReached, sx: {
                                    margin: 1,
                                }, children: "Choose a file" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "(Limit 5)" }), (0, jsx_runtime_1.jsx)(UploadFileRounded_1.default, {})] })] }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { padding: "15px 0", direction: "row", flexWrap: "wrap", children: [files?.map((file) => ((0, jsx_runtime_1.jsx)(FileUploadPreview_1.FileUploadPreview, { fileIdentifier: file, defaultTileImageKey: defaultTileImageKey, removeFile: removeNewFile, setDefaultTileImage: (fileId) => setDefaultTileImageKey(fileId) }, file.id))), preExistingImageUrls
                        ?.filter((existingImage) => !filesToDelete.includes(existingImage))
                        .map((url) => ((0, jsx_runtime_1.jsx)(FileUploadPreview_1.FileUploadPreview, { fileIdentifier: url, defaultTileImageKey: defaultTileImageKey, removeFile: handleFileDeletion, setDefaultTileImage: (fileId) => setDefaultTileImageKey(fileId) }, url)))] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackBarOpen, anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                }, onClose: closeSnackBar, autoHideDuration: 4000, message: snackBarMessage }, 'bottom' + 'center')] }));
};
exports.default = FileUpload;
//# sourceMappingURL=FileUpload.js.map