"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ContentCopyRounded_1 = __importDefault(require("@mui/icons-material/ContentCopyRounded"));
const EditRounded_1 = __importDefault(require("@mui/icons-material/EditRounded"));
const material_1 = require("@mui/material");
const dompurify_1 = __importDefault(require("dompurify"));
const react_1 = require("react");
const react_router_1 = require("react-router");
const tags_1 = require("../../models/tags");
const recipe_services_1 = require("../../services/recipe-services");
const RecipeDialog_1 = __importStar(require("../Dashboard/Category/RecipeDialog"));
const Spinner_1 = require("../Spinner");
const LightboxComponent_1 = __importDefault(require("./LightboxComponent/LightboxComponent"));
const MobileRecipeToolbar_1 = __importDefault(require("./MobileRecipeToolbar"));
const Recipe = (props) => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [recipe, setRecipe] = (0, react_1.useState)(null);
    const [tags, setTags] = (0, react_1.useState)(tags_1.recipeTagChips);
    const [cloning, setCloning] = (0, react_1.useState)(false);
    const [width, setWidth] = (0, react_1.useState)(window.innerWidth);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [preSignedUrls, setPresignedUrls] = (0, react_1.useState)([]);
    const navigate = (0, react_router_1.useNavigate)();
    const triggerDialog = () => {
        setDialogOpen(!dialogOpen);
    };
    const params = (0, react_router_1.useParams)();
    const theme = (0, material_1.useTheme)();
    const fetchData = async () => {
        try {
            const recipe = await recipe_services_1.RecipeService.getRecipe(params.id);
            setRecipe(recipe);
            setLoading(false);
            if (recipe.preSignedUrls) {
                setPresignedUrls(recipe.preSignedUrls);
            }
            else {
                setPresignedUrls([]);
            }
            const tagState = tags.map((tag) => {
                tag.selected = !!recipe.tags.includes(tag.recipeTagPropertyName);
                return tag;
            });
            setTags(tagState);
        }
        catch (err) {
            console.log(err);
            if (err.response?.status === 401) {
                // unathenticated; redirect to log in
                navigate('/login');
            }
        }
    };
    (0, react_1.useEffect)(() => {
        fetchData();
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (cloning && !dialogOpen)
            setCloning(false);
    }, [dialogOpen]);
    const handleWindowSizeChange = () => {
        setWidth(window.innerWidth);
    };
    const cloneRecipe = () => {
        setPresignedUrls([]);
        setCloning(true);
        triggerDialog();
    };
    const noGridStyles = {
        display: 'flex',
        padding: '30px 0',
        justifyContent: 'center',
        span: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
        },
        img: {
            width: '100%',
            maxWidth: '400px',
            borderRadius: '5px',
            boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
        },
    };
    const imagesStyles = {
        padding: '20px 0',
        display: 'grid',
        gridTemplateColumns: '1fr',
        [theme.breakpoints.up('md')]: {
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto',
            gap: '0 15px',
        },
        img: {
            width: '100%',
            margin: '0 0 15px 0',
            borderRadius: '5px',
            boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
        },
    };
    const getImageStyles = (lessThanTwoImages) => {
        return lessThanTwoImages ? noGridStyles : imagesStyles;
    };
    const toggleModal = () => {
        setDialogOpen(!dialogOpen);
    };
    return !loading && recipe ? ((0, jsx_runtime_1.jsxs)(material_1.Stack, { sx: {
            height: `calc(100% - 50px)`,
            overflow: 'auto',
            [theme.breakpoints.up('md')]: {
                height: 'auto',
            },
        }, children: [(0, jsx_runtime_1.jsx)(RecipeDialog_1.default, { mode: RecipeDialog_1.Mode.Edit, open: dialogOpen, toggleModal: toggleModal, recipeDialogInfo: {
                    recipe,
                    cloning,
                    defaultTileImageKey: recipe.defaultTileImageKey,
                    openSnackBar: props.openSnackBar,
                    presignedUrls: preSignedUrls,
                    fetchData: fetchData,
                    addRecipeMutation: props.addRecipeMutation,
                    triggerDialog: triggerDialog,
                } }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { margin: "0 auto", padding: "20px", width: "100%", flexGrow: "1", children: [(0, jsx_runtime_1.jsx)(MobileRecipeToolbar_1.default, { width: width, triggerDialog: triggerDialog, cloneRecipe: cloneRecipe }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                            width: '100%',
                            [theme.breakpoints.up('md')]: {
                                width: '75%',
                                margin: '20px auto',
                            },
                            [theme.breakpoints.up('lg')]: {
                                width: '60%',
                            },
                            p: {
                                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                            },
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { dangerouslySetInnerHTML: {
                                    __html: dompurify_1.default.sanitize(recipe.title),
                                } }), (0, jsx_runtime_1.jsx)(material_1.Box, { dangerouslySetInnerHTML: { __html: recipe.ingredients } }), (0, jsx_runtime_1.jsx)(material_1.Box, { dangerouslySetInnerHTML: { __html: recipe.directions } }), (0, jsx_runtime_1.jsx)(material_1.Stack, { spacing: 1, direction: "row", children: tags.map((tag) => tag.selected ? (0, jsx_runtime_1.jsx)(material_1.Chip, { label: tag.label }, tag.label) : null) }), (0, jsx_runtime_1.jsx)(material_1.Divider, { style: { margin: '20px 0 10px 0' } }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: getImageStyles(recipe.preSignedUrls ? recipe.preSignedUrls?.length < 2 : false), children: (0, jsx_runtime_1.jsx)(LightboxComponent_1.default, { preSignedUrls: recipe.preSignedUrls }) })] })] }), width > 700 ? ((0, jsx_runtime_1.jsxs)(material_1.Box, { position: "fixed", bottom: "20px", right: "20px", sx: {
                    button: {
                        marginRight: '10px',
                    },
                }, children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "Edit recipe", "aria-label": "edit recipe", children: (0, jsx_runtime_1.jsx)(material_1.Fab, { color: "secondary", onClick: triggerDialog, children: (0, jsx_runtime_1.jsx)(EditRounded_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "Duplicate recipe", "aria-label": "duplicate", children: (0, jsx_runtime_1.jsx)(material_1.Fab, { color: "primary", onClick: cloneRecipe, children: (0, jsx_runtime_1.jsx)(ContentCopyRounded_1.default, {}) }) })] })) : null] })) : ((0, jsx_runtime_1.jsx)(Spinner_1.Spinner, {}));
};
exports.default = Recipe;
//# sourceMappingURL=Recipe.js.map