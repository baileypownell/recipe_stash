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
exports.CreateRecipeWidget = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const AddCircleRounded_1 = __importDefault(require("@mui/icons-material/AddCircleRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const asparagus_jpg_1 = __importDefault(require("../../../images/asparagus.jpg"));
const bread_jpg_1 = __importDefault(require("../../../images/bread.jpg"));
const dessert_jpg_1 = __importDefault(require("../../../images/dessert.jpg"));
const drinks_jpg_1 = __importDefault(require("../../../images/drinks.jpg"));
const french_toast_jpg_1 = __importDefault(require("../../../images/french_toast.jpg"));
const lunch_jpg_1 = __importDefault(require("../../../images/lunch.jpg"));
const pizza_jpg_1 = __importDefault(require("../../../images/pizza.jpg"));
const Dashboard_1 = require("../Dashboard");
const RecipeDialog_1 = __importStar(require("./RecipeDialog"));
const getBackgroundImage = (categoryId) => {
    switch (categoryId) {
        case 'breakfast':
            return french_toast_jpg_1.default;
        case 'lunch':
            return lunch_jpg_1.default;
        case 'dinner':
            return pizza_jpg_1.default;
        case 'side_dish':
            return asparagus_jpg_1.default;
        case 'drinks':
            return drinks_jpg_1.default;
        case 'dessert':
            return dessert_jpg_1.default;
        case 'other':
            return bread_jpg_1.default;
        default:
            return '';
    }
};
const CreateRecipeWidget = ({ gridView, id, addRecipe, title, }) => {
    const theme = (0, material_1.useTheme)();
    const [open, setOpen] = (0, react_1.useState)(false);
    const toggleModal = () => setOpen(!open);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [gridView === Dashboard_1.GridView.Grid ? ((0, jsx_runtime_1.jsx)(material_1.Stack, { justifyContent: "center", alignItems: "center", padding: 2, minHeight: "120px", onClick: toggleModal, id: id, sx: {
                    backgroundImage: `url(${getBackgroundImage(id)})`,
                    boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
                    minWidth: '150px',
                    backgroundBlendMode: 'overlay',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginRight: '10px',
                    marginBottom: '10px',
                    color: theme.palette.primary.main,
                    borderRadius: '5px',
                    border: `2px solid ${theme.palette.primary.main}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.5s',
                    '&:hover': {
                        backgroundColor: 'rgba(331, 68, 68, 0.2)',
                    },
                }, children: (0, jsx_runtime_1.jsx)(AddCircleRounded_1.default, { color: "info", sx: { fontSize: '45px' } }) })) : ((0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "orange", onClick: toggleModal, sx: { marginBottom: 1, color: theme.palette.info.main }, startIcon: (0, jsx_runtime_1.jsx)(AddCircleRounded_1.default, {}), children: "Add Recipe" })), (0, jsx_runtime_1.jsx)(RecipeDialog_1.default, { mode: RecipeDialog_1.Mode.Add, open: open, toggleModal: toggleModal, recipeDialogInfo: {
                    category: title,
                    addRecipe: addRecipe,
                } })] }));
};
exports.CreateRecipeWidget = CreateRecipeWidget;
//# sourceMappingURL=CreateRecipeWidget.js.map