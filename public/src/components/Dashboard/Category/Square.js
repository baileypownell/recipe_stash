"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_loading_skeleton_1 = __importDefault(require("react-loading-skeleton"));
const react_router_1 = require("react-router");
const Chips_1 = __importDefault(require("./Chips"));
const RecipeCard = ({ viewRecipe, recipe, rawTitle, defaultTileImageUrl, }) => {
    const theme = (0, material_1.useTheme)();
    const imageTileStyles = {
        backgroundBlendMode: 'overlay',
        backgroundColor: theme.palette.gray.main,
        boxShadow: `0px 2px 10px ${theme.palette.gray.main}`,
        color: theme.palette.info.main,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        transition: 'background-color 0.3s',
        width: '250px',
        height: '150px',
    };
    const tileStyles = {
        width: '250px',
        height: '150px',
        marginRight: '10px',
        marginBottom: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
        minHeight: '120px',
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Card, { component: material_1.Button, onClick: viewRecipe, sx: { ...tileStyles, ...(defaultTileImageUrl && imageTileStyles) }, style: {
            backgroundImage: defaultTileImageUrl
                ? `url(${defaultTileImageUrl})`
                : 'none',
        }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: {
                width: '100%',
                height: '100%',
                padding: '8px',
            }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "div", marginBottom: 1, sx: {
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textTransform: 'none',
                    }, children: rawTitle }), (0, jsx_runtime_1.jsx)(Chips_1.default, { tags: recipe.tags })] }) }));
};
const Square = ({ recipe }) => {
    const recipeId = recipe.id;
    const defaultTileImageUrl = recipe.preSignedDefaultTileImageUrl;
    const rawTitle = recipe.rawTitle;
    const [imageLoaded, setImageLoaded] = (0, react_1.useState)(false);
    const [imageLoadingError, setImageLoadingError] = (0, react_1.useState)(false);
    const [skeletonWidth, setSkeletonWidth] = (0, react_1.useState)(150);
    const [skeletonHeight, setSkeletonHeight] = (0, react_1.useState)(150);
    const navigate = (0, react_router_1.useNavigate)();
    const viewRecipe = () => {
        navigate(`/recipes/${recipeId}`);
    };
    const handleWindowSizeChange = () => {
        let skeletonHeight, skeletonWidth;
        if (window.innerWidth >= 600) {
            skeletonHeight = 100;
            skeletonWidth = 175;
        }
        else {
            skeletonHeight = 120;
            skeletonWidth = 120;
        }
        setSkeletonWidth(skeletonWidth);
        setSkeletonHeight(skeletonHeight);
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        handleWindowSizeChange();
        return window.removeEventListener('resize', handleWindowSizeChange);
    }, []);
    if (!defaultTileImageUrl)
        return ((0, jsx_runtime_1.jsx)(RecipeCard, { viewRecipe: viewRecipe, recipe: recipe, rawTitle: rawTitle }));
    // a <Square/> should not render until the background image (if there is one) is fully loaded
    // this means we need to technically render an <img/> so that we can react with the onLoad listener & then render the div
    return imageLoaded ? ((0, jsx_runtime_1.jsx)(RecipeCard, { viewRecipe: viewRecipe, recipe: recipe, rawTitle: rawTitle, defaultTileImageUrl: defaultTileImageUrl })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("img", { src: defaultTileImageUrl, style: { display: 'none' }, onLoad: () => setImageLoaded(true), onError: () => setImageLoadingError(true), alt: `${rawTitle}` }), !imageLoadingError ? ((0, jsx_runtime_1.jsx)(react_loading_skeleton_1.default, { width: skeletonWidth, height: skeletonHeight })) : ((0, jsx_runtime_1.jsx)(RecipeCard, { viewRecipe: viewRecipe, recipe: recipe, rawTitle: rawTitle }))] }));
};
exports.default = Square;
//# sourceMappingURL=Square.js.map