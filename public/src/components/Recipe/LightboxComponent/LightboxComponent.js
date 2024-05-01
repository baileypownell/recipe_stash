"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ArrowBackIosNewRounded_1 = __importDefault(require("@mui/icons-material/ArrowBackIosNewRounded"));
const ArrowForwardIosRounded_1 = __importDefault(require("@mui/icons-material/ArrowForwardIosRounded"));
const CloseRounded_1 = __importDefault(require("@mui/icons-material/CloseRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_spring_lightbox_1 = __importDefault(require("react-spring-lightbox"));
const ImageSkeletonLoader_1 = __importDefault(require("./ImageSkeletonLoader"));
const LightboxComponent = ({ preSignedUrls }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [currentImageIndex, setCurrentImageIndex] = (0, react_1.useState)(0);
    const gotoPrevious = () => currentImageIndex > 0 && setCurrentImageIndex(currentImageIndex - 1);
    const gotoNext = () => currentImageIndex + 1 < images?.length &&
        setCurrentImageIndex(currentImageIndex + 1);
    const images = preSignedUrls
        ? preSignedUrls.map((url) => ({
            src: url,
            loading: 'lazy',
            alt: 'Alt text',
        }))
        : [];
    const triggerLightbox = (photoIndex) => {
        setIsOpen(true);
        setCurrentImageIndex(photoIndex);
    };
    const onClose = () => {
        setIsOpen(false);
        setTimeout(() => setCurrentImageIndex(0), 500);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [preSignedUrls?.map((url, i) => ((0, jsx_runtime_1.jsx)(ImageSkeletonLoader_1.default, { openLightBox: () => triggerLightbox(i), url: url }, url))), (0, jsx_runtime_1.jsx)(react_spring_lightbox_1.default, { isOpen: isOpen, onPrev: gotoPrevious, onNext: gotoNext, images: images, currentIndex: currentImageIndex, onClose: onClose, renderHeader: () => ((0, jsx_runtime_1.jsx)(material_1.Box, { padding: 1, textAlign: "right", marginTop: "64px", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "info", onClick: onClose, children: (0, jsx_runtime_1.jsx)(CloseRounded_1.default, {}) }) })), renderPrevButton: () => ((0, jsx_runtime_1.jsx)(material_1.Button, { color: "info", onClick: gotoPrevious, children: (0, jsx_runtime_1.jsx)(ArrowBackIosNewRounded_1.default, {}) })), renderNextButton: () => ((0, jsx_runtime_1.jsx)(material_1.Button, { color: "info", onClick: gotoNext, children: (0, jsx_runtime_1.jsx)(ArrowForwardIosRounded_1.default, {}) })), style: { background: `rgba(29,29,29, 0.95` } })] }));
};
exports.default = LightboxComponent;
//# sourceMappingURL=LightboxComponent.js.map