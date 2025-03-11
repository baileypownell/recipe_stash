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
exports.AddRecipeButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const RecipeDialog_1 = __importStar(require("./Category/RecipeDialog"));
const AddRecipeButton = ({ addRecipe }) => {
    const [open, setOpen] = (0, react_1.useState)(false);
    const toggleModal = () => setOpen(!open);
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { width: "full", textAlign: "right", sx: {
            position: 'sticky',
            bottom: 16,
            right: 16,
        }, children: [(0, jsx_runtime_1.jsx)(material_1.Fab, { color: "primary", "aria-label": "Create a new recipe", autoFocus: true, onClick: toggleModal, children: (0, jsx_runtime_1.jsx)(Add_1.default, {}) }), (0, jsx_runtime_1.jsx)(RecipeDialog_1.default, { mode: RecipeDialog_1.Mode.Add, open: open, toggleModal: toggleModal, recipeDialogInfo: { addRecipe } })] }));
};
exports.AddRecipeButton = AddRecipeButton;
//# sourceMappingURL=AddRecipeButton.js.map