"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_loading_skeleton_1 = __importDefault(require("react-loading-skeleton"));
require("react-loading-skeleton/dist/skeleton.css");
function ImageSkeletonLoader({ url, openLightBox }) {
    const [imageLoaded, setImageLoaded] = (0, react_1.useState)(false);
    return imageLoaded ? ((0, jsx_runtime_1.jsx)("img", { onClick: () => openLightBox(), style: { cursor: 'pointer' }, src: url, alt: url }, url)) : ((0, jsx_runtime_1.jsxs)(material_1.Box, { height: "300px", marginBottom: "10px", children: [(0, jsx_runtime_1.jsx)("img", { src: url, style: { display: 'none' }, onLoad: () => setImageLoaded(true), alt: url }), (0, jsx_runtime_1.jsx)(react_loading_skeleton_1.default, { height: "100%" })] }));
}
exports.default = ImageSkeletonLoader;
//# sourceMappingURL=ImageSkeletonLoader.js.map