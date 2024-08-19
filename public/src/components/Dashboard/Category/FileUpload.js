"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const UploadFileRounded_1 = __importDefault(require("@mui/icons-material/UploadFileRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const ImagePreview_1 = require("./ImagePreview");
const getDefaultState = (i, index, checked, file) => {
    // return i === index
    //   ? checked
    //     ? true
    //     : false
    //   : checked
    //   ? false
    //   : file.isDefault;
    return i === index ? checked : checked ? false : file.isDefault;
};
const FileUpload = ({ passFiles, preExistingImageUrls, defaultTileImageUUID, }) => {
    const input = (0, react_1.useRef)(null);
    const theme = (0, material_1.useTheme)();
    const { control, watch, setValue } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            files: [],
            preExistingFiles: preExistingImageUrls
                ? preExistingImageUrls.map((url) => ({
                    url,
                    isDefault: defaultTileImageUUID
                        ? url.includes(defaultTileImageUUID)
                        : false,
                }))
                : [],
        },
    });
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'files',
    });
    const { fields: existingFiles, remove: removeExistingFile } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'preExistingFiles',
    });
    const files = watch('files');
    const preExistingFiles = watch('preExistingFiles');
    (0, react_1.useEffect)(() => {
        const combinedFiles = [...files, ...preExistingFiles].filter((file) => file !== undefined);
        passFiles(combinedFiles);
    }, [fields, existingFiles]);
    const openFileFinder = () => {
        if (input.current)
            input.current.click();
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fileList = e.dataTransfer.files;
        if (!fileList.length) {
            return;
        }
        append(Array.from(e.dataTransfer.files).map((file) => ({
            file,
            backgroundImage: URL.createObjectURL(file),
            isDefault: false,
        })));
    };
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
                }, onDrop: handleDrop, onDragOver: handleDrop, children: [(0, jsx_runtime_1.jsx)("input", { ref: input, type: "file", accept: "image/png, image/jpeg, image/jpg", disabled: false, onChange: (e) => {
                            append(Array.from(e.target.files).map((file) => ({
                                file,
                                backgroundImage: URL.createObjectURL(file),
                                isDefault: false,
                            })));
                        }, multiple: true, title: "Upload a file" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '25px',
                            svg: {
                                fontSize: '100px',
                                marginTop: '15px',
                            },
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "overline", children: "Drag & drop an image" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "secondary", onClick: openFileFinder, disabled: false, sx: {
                                    margin: 1,
                                }, children: "Choose a file" }), (0, jsx_runtime_1.jsx)(UploadFileRounded_1.default, {})] })] }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { padding: "15px 0", direction: "row", flexWrap: "wrap", children: [fields.map((item, index) => ((0, jsx_runtime_1.jsx)(ImagePreview_1.ImagePreview, { item: item, index: index, remove: remove, control: control, backgroundImageUrl: item.backgroundImage, onChange: (e) => {
                            setValue('files', files.map((file, i) => {
                                return {
                                    ...file,
                                    isDefault: getDefaultState(i, index, e.target.checked, file),
                                };
                            }));
                            if (existingFiles.length) {
                                setValue('preExistingFiles', preExistingFiles.map((file) => ({
                                    ...file,
                                    isDefault: false,
                                })));
                            }
                        } }, item.id))), existingFiles.map((item, index) => ((0, jsx_runtime_1.jsx)(ImagePreview_1.ImagePreview, { item: item, control: control, remove: removeExistingFile, index: index, backgroundImageUrl: item.url, onChange: (e) => {
                            setValue('preExistingFiles', preExistingFiles.map((file, i) => {
                                return {
                                    ...file,
                                    isDefault: getDefaultState(i, index, e.target.checked, file),
                                };
                            }));
                            if (fields.length) {
                                setValue('files', files.map((file) => ({
                                    ...file,
                                    isDefault: false,
                                })));
                            }
                        } }, item.id)))] })] }));
};
exports.default = FileUpload;
//# sourceMappingURL=FileUpload.js.map