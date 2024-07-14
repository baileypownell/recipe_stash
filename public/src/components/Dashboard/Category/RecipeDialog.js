"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mode = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const AddCircleRounded_1 = __importDefault(require("@mui/icons-material/AddCircleRounded"));
const CancelRounded_1 = __importDefault(require("@mui/icons-material/CancelRounded"));
const DeleteOutlineRounded_1 = __importDefault(require("@mui/icons-material/DeleteOutlineRounded"));
const ExpandMore_1 = __importDefault(require("@mui/icons-material/ExpandMore"));
const lab_1 = require("@mui/lab");
const material_1 = require("@mui/material");
const dompurify_1 = __importDefault(require("dompurify"));
const html_to_text_1 = require("html-to-text");
const react_1 = require("react");
const react_quill_1 = __importDefault(require("react-quill"));
require("react-quill/dist/quill.snow.css");
const react_router_1 = require("react-router");
const options_1 = __importDefault(require("../../../models/options"));
const tags_1 = require("../../../models/tags");
const recipe_services_1 = require("../../../services/recipe-services");
const App_1 = require("../../App");
const FileUpload_1 = __importDefault(require("./FileUpload"));
var Mode;
(function (Mode) {
    Mode["Add"] = "Add";
    Mode["Edit"] = "Edit";
})(Mode || (exports.Mode = Mode = {}));
const determineCategory = (recipeDialogInfo, mode) => {
    if (mode === Mode.Add) {
        return options_1.default.find((option) => option.label === recipeDialogInfo.category).value;
    }
    else if (mode === Mode.Edit) {
        return recipeDialogInfo.recipe.category;
    }
    else {
        return '';
    }
};
const RecipeDialog = ({ recipeDialogInfo, mode, toggleModal, open }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [recipeTitle, setRecipeTitle] = (0, react_1.useState)('');
    const [ingredients, setIngredients] = (0, react_1.useState)('');
    const [directions, setDirections] = (0, react_1.useState)('');
    const [category, setCategory] = (0, react_1.useState)(determineCategory(recipeDialogInfo, mode));
    const [recipeValid, setRecipeValid] = (0, react_1.useState)(false);
    const [newFiles, setNewFiles] = (0, react_1.useState)([]);
    const [tags, setTags] = (0, react_1.useState)(tags_1.recipeTagChips.map((tag) => ({ ...tag, selected: false })));
    const [defaultTile, setDefaultTile] = (0, react_1.useState)(null);
    const [filesToDelete, setFilesToDelete] = (0, react_1.useState)([]);
    const [recipeTitleRaw, setRecipeTitleRaw] = (0, react_1.useState)('');
    const navigate = (0, react_router_1.useNavigate)();
    const theme = (0, material_1.useTheme)();
    (0, react_1.useEffect)(() => {
        if (mode === Mode.Edit) {
            const recipe = recipeDialogInfo.recipe;
            setRecipeTitle(recipe.title);
            setIngredients(recipe.ingredients);
            setDirections(recipe.directions);
            tags.map((tag) => {
                if (recipeDialogInfo.recipe.tags.includes(tag.recipeTagPropertyName)) {
                    tag.selected = true;
                }
                return tag;
            });
        }
    }, []);
    const clearState = () => {
        setRecipeTitle('');
        setIngredients('');
        setDirections('');
        toggleModal();
        setTags(tags);
    };
    const determineTags = () => {
        return {
            isNoBake: tags[0].selected,
            isEasy: tags[1].selected,
            isHealthy: tags[2].selected,
            isGlutenFree: tags[3].selected,
            isDairyFree: tags[4].selected,
            isSugarFree: tags[5].selected,
            isVegetarian: tags[6].selected,
            isVegan: tags[7].selected,
            isKeto: tags[8].selected,
            isHighProtein: tags[9].selected,
        };
    };
    const saveRecipe = async (e) => {
        e.preventDefault();
        const titleHTML = dompurify_1.default.sanitize(recipeTitleRaw || recipeDialogInfo.recipe.rawTitle);
        const rawTitle = (0, html_to_text_1.htmlToText)(titleHTML, { wordwrap: 130 });
        setLoading(true);
        const recipeInput = {
            title: dompurify_1.default.sanitize(recipeTitle, {}),
            rawTitle,
            category,
            ingredients: dompurify_1.default.sanitize(ingredients, {}),
            directions: dompurify_1.default.sanitize(directions, {}),
            ...determineTags(),
        };
        try {
            if (mode === Mode.Add) {
                await recipeDialogInfo.addRecipe({
                    recipeInput,
                    files: newFiles,
                    defaultTile,
                });
                clearState();
                setLoading(false);
            }
            else if (mode === Mode.Edit) {
                if (recipeDialogInfo.cloning) {
                    const param = {
                        recipeInput,
                        files: newFiles,
                        defaultTile,
                    };
                    const recipe = await recipeDialogInfo.addRecipeMutation(param);
                    setFilesToDelete([]);
                    setNewFiles([]);
                    setLoading(false);
                    navigate(`/recipes/${recipe.id}`);
                    window.location.reload();
                    recipeDialogInfo.triggerDialog();
                }
                else {
                    setLoading(true);
                    const recipeUpdateInput = {
                        title: recipeTitle,
                        rawTitle,
                        ingredients: ingredients,
                        directions: directions,
                        recipeId: recipeDialogInfo.recipe.id,
                        category,
                        ...determineTags(),
                    };
                    try {
                        const updatedRecipe = await recipe_services_1.RecipeService.updateRecipe(recipeUpdateInput, newFiles, defaultTile, filesToDelete, recipeDialogInfo.recipe.id, recipeDialogInfo
                            .recipe);
                        const formattedRecipe = await recipe_services_1.RecipeService.getRecipe(updatedRecipe.recipe_uuid);
                        App_1.queryClient.setQueryData('recipes', () => {
                            const current = App_1.queryClient.getQueryData('recipes');
                            const updatedArray = current[category].map((recipe) => {
                                if (recipe.id === updatedRecipe.recipe_uuid) {
                                    return formattedRecipe;
                                }
                                return recipe;
                            });
                            const updatedCategory = updatedArray;
                            return {
                                ...current,
                                [category]: updatedCategory,
                            };
                        });
                        refreshRecipeView();
                        setLoading(false);
                    }
                    catch (err) {
                        console.log(err);
                        setLoading(false);
                        recipeDialogInfo.openSnackBar('There was an error updating the recipe.');
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
            setLoading(false);
        }
    };
    const refreshRecipeView = () => {
        recipeDialogInfo.triggerDialog();
        recipeDialogInfo.fetchData();
        setFilesToDelete([]);
        setNewFiles([]);
    };
    const updateCategory = (e) => setCategory(e.target.value);
    const toggleTagSelectionStatus = (index) => {
        const copyTags = [...tags];
        const item = { ...copyTags[index] };
        const priorSelectedValue = item.selected;
        item.selected = !priorSelectedValue;
        copyTags[index] = item;
        setTags(copyTags);
    };
    const handleModelChange = (html, _, __, editor) => {
        setRecipeTitle(html);
        const recipe_title_raw = editor.getText();
        setRecipeTitleRaw(recipe_title_raw);
    };
    const handleModelChangeIngredients = (html) => setIngredients(html);
    const handleModelChangeDirections = (html) => setDirections(html);
    (0, react_1.useEffect)(() => {
        const rawDirections = (0, html_to_text_1.htmlToText)(directions);
        const rawIngredients = (0, html_to_text_1.htmlToText)(ingredients);
        const rawTitle = (0, html_to_text_1.htmlToText)(recipeTitle);
        const recipeValid = !!rawDirections.trim() && !!rawIngredients.trim() && !!rawTitle.trim();
        setRecipeValid(recipeValid);
    }, [recipeTitle, ingredients, directions]);
    const getTitle = () => {
        if (mode === Mode.Add) {
            return 'Add Recipe';
        }
        else if (mode === Mode.Edit) {
            return recipeDialogInfo.cloning
                ? 'Add Recipe'
                : 'Edit Recipe';
        }
    };
    const deleteRecipe = async () => {
        try {
            await recipe_services_1.RecipeService.deleteRecipe(recipeDialogInfo.recipe.id);
            const current = App_1.queryClient.getQueryData('recipes');
            App_1.queryClient.setQueryData('recipes', () => {
                const updatedArray = current[category].filter((el) => el.id !== recipeDialogInfo.recipe.id);
                const updatedCategory = updatedArray;
                const updatedQueryState = {
                    ...current,
                    [category]: updatedCategory,
                };
                return updatedQueryState;
            });
            navigate('/recipes');
        }
        catch (err) {
            console.log(err);
            recipeDialogInfo.openSnackBar('There was an error.');
        }
    };
    const editing = !recipeDialogInfo.cloning && mode === Mode.Edit;
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { fullScreen: true, open: open, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: getTitle() }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { paddingBottom: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "overline", children: "Recipe Name" }), (0, jsx_runtime_1.jsx)(react_quill_1.default, { defaultValue: mode === Mode.Edit
                                    ? recipeDialogInfo.recipe.title
                                    : null, onChange: handleModelChange })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { paddingBottom: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "overline", children: "Ingredients" }), (0, jsx_runtime_1.jsx)(react_quill_1.default, { defaultValue: mode === Mode.Edit
                                    ? recipeDialogInfo.recipe.ingredients
                                    : null, onChange: handleModelChangeIngredients })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { paddingBottom: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "overline", children: "Directions" }), (0, jsx_runtime_1.jsx)(react_quill_1.default, { defaultValue: mode === Mode.Edit
                                    ? recipeDialogInfo.recipe.directions
                                    : null, onChange: handleModelChangeDirections })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { variant: "filled", style: { width: '100%', margin: '10px 0' }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "Category" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: category, onChange: updateCategory, children: options_1.default.map((val, index) => {
                                        return ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: val.value, children: val.label }, index));
                                    }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Accordion, { style: { margin: '10px 0' }, children: [(0, jsx_runtime_1.jsx)(material_1.AccordionSummary, { expandIcon: (0, jsx_runtime_1.jsx)(ExpandMore_1.default, {}), children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "Recipe Tags" }) }), (0, jsx_runtime_1.jsxs)(material_1.AccordionDetails, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { mb: 2, children: "Use tags to characterize your recipe so that you can easily find recipes with similar tags through the dashboard filter." }), (0, jsx_runtime_1.jsx)(material_1.Stack, { spacing: 1, direction: "row", children: tags.map((tag, index) => {
                                            return ((0, jsx_runtime_1.jsx)(material_1.Chip, { color: tags[index].selected ? 'primary' : 'default', id: index.toString(), onClick: () => toggleTagSelectionStatus(index), label: tag.label }, tag.label));
                                        }) })] })] }), mode === Mode.Add ? ((0, jsx_runtime_1.jsx)(FileUpload_1.default, { passDefaultTileImage: (fileId) => setDefaultTile(fileId), passFiles: (newFiles) => setNewFiles(newFiles) })) : ((0, jsx_runtime_1.jsx)(FileUpload_1.default, { defaultTileImageUUID: recipeDialogInfo.defaultTileImageKey, passDefaultTileImage: (fileId) => setDefaultTile(fileId), preExistingImageUrls: recipeDialogInfo.presignedUrls, passFilesToDelete: setFilesToDelete, passFiles: (newFiles) => setNewFiles(newFiles) }))] }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { justifyContent: "space-between", spacing: 1, alignItems: "center", sx: {
                        width: '100%',
                        [theme.breakpoints.up('sm')]: {
                            flexDirection: 'row-reverse',
                        },
                        button: {
                            [theme.breakpoints.up('sm')]: {
                                margin: 0,
                            },
                        },
                    }, children: [(0, jsx_runtime_1.jsx)(lab_1.LoadingButton, { variant: "contained", color: "secondary", disabled: !recipeValid, loading: loading, onClick: saveRecipe, startIcon: loading ? null : (0, jsx_runtime_1.jsx)(AddCircleRounded_1.default, {}), children: mode === Mode.Add || recipeDialogInfo.cloning
                                ? 'Add Recipe'
                                : 'Update Recipe' }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                display: editing ? 'flex' : 'block',
                                marginTop: `0!important`,
                            }, children: [editing ? ((0, jsx_runtime_1.jsx)(material_1.Button, { color: "primary", variant: "contained", style: {
                                        marginRight: '5px ',
                                        width: '100%',
                                        whiteSpace: 'nowrap',
                                        minWidth: 'auto',
                                    }, onClick: deleteRecipe, startIcon: (0, jsx_runtime_1.jsx)(DeleteOutlineRounded_1.default, {}), children: "Delete Recipe" })) : null, (0, jsx_runtime_1.jsx)(material_1.Button, { sx: {
                                        flexGrow: editing ? 1 : 0,
                                        width: '100%',
                                    }, onClick: toggleModal, variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(CancelRounded_1.default, {}), children: "Cancel" })] })] }) })] }));
};
exports.default = RecipeDialog;
//# sourceMappingURL=RecipeDialog.js.map