"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_loading_skeleton_1 = __importDefault(require("react-loading-skeleton"));
const Chips_1 = __importDefault(require("./Chips"));
const react_router_dom_1 = require("react-router-dom");
const CARD_HEIGHT = 150;
const CARD_WIDTH = 250;
const RecipeCard = ({ recipe, rawTitle, defaultTileImageUrl, }) => {
    const theme = (0, material_1.useTheme)();
    const imageTileStyles = {
        backgroundBlendMode: 'overlay',
        backgroundColor: theme.palette.gray.main,
        color: theme.palette.info.main,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        transition: 'background-color 0.3s',
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
    };
    const tileStyles = {
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        borderRadius: '5px',
        cursor: 'pointer',
        minHeight: '120px',
        transition: 'box-shadow 300ms',
        transitionTimingFunction: 'ease-in-out',
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
            '&&': {
                '> a': {
                    textDecoration: 'none',
                    '&:hover': {
                        '> div': {
                            boxShadow: `0px 3px 10px ${theme.palette.primary.dark}`,
                        },
                    },
                    '&:focus': {
                        outline: 'none',
                        '> div': {
                            boxShadow: `0px 3px 10px ${theme.palette.primary.main}`,
                        },
                    },
                },
            },
        }, children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: `/recipes/${recipe.id}`, target: "_blank", children: (0, jsx_runtime_1.jsx)(material_1.Card, { elevation: 5, sx: { ...tileStyles, ...(defaultTileImageUrl && imageTileStyles) }, style: {
                    textDecoration: 'none!important',
                    backgroundImage: defaultTileImageUrl
                        ? `url(${defaultTileImageUrl})`
                        : 'none',
                }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: {
                        width: '100%',
                        height: '100%',
                        padding: '8px',
                    }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", marginBottom: 1, textAlign: "center", sx: {
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textTransform: 'none',
                            }, children: rawTitle }), (0, jsx_runtime_1.jsx)(Chips_1.default, { tags: recipe.tags })] }) }) }) }));
};
const Square = ({ recipe }) => {
    const defaultTileImageUrl = recipe.preSignedDefaultTileImageUrl;
    const rawTitle = recipe.rawTitle;
    const [imageLoaded, setImageLoaded] = (0, react_1.useState)(false);
    const [imageLoadingError, setImageLoadingError] = (0, react_1.useState)(false);
    if (!defaultTileImageUrl)
        return (0, jsx_runtime_1.jsx)(RecipeCard, { recipe: recipe, rawTitle: rawTitle });
    // a <Square/> should not render until the background image (if there is one) is fully loaded
    // this means we need to technically render an <img/> so that we can react with the onLoad listener & then render the div
    return imageLoaded ? ((0, jsx_runtime_1.jsx)(RecipeCard, { recipe: recipe, rawTitle: rawTitle, defaultTileImageUrl: defaultTileImageUrl })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("img", { src: defaultTileImageUrl, style: { display: 'none' }, onLoad: () => setImageLoaded(true), onError: () => setImageLoadingError(true), alt: `${rawTitle}` }), !imageLoadingError ? ((0, jsx_runtime_1.jsx)(react_loading_skeleton_1.default, { width: CARD_WIDTH, height: CARD_HEIGHT })) : ((0, jsx_runtime_1.jsx)(RecipeCard, { recipe: recipe, rawTitle: rawTitle }))] }));
};
exports.default = Square;
//# sourceMappingURL=Square.js.map