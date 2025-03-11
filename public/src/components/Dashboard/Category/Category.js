"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const Dashboard_1 = require("../Dashboard");
const ListItem_1 = __importDefault(require("./ListItem"));
const Square_1 = __importDefault(require("./Square"));
const Category = ({ title, recipes, gridView }) => ((0, jsx_runtime_1.jsxs)(material_1.Box, { paddingTop: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", marginBottom: 1, children: title }), (0, jsx_runtime_1.jsx)(material_1.Stack, { direction: "row", flexWrap: "wrap", gap: 1.5, children: recipes
                ? recipes.map((recipe) => gridView === Dashboard_1.GridView.Grid ? ((0, jsx_runtime_1.jsx)(Square_1.default, { recipe: recipe }, recipe.id)) : ((0, jsx_runtime_1.jsx)(ListItem_1.default, { recipeId: recipe.id, rawTitle: recipe.rawTitle }, recipe.id)))
                : null })] }));
exports.default = Category;
//# sourceMappingURL=Category.js.map