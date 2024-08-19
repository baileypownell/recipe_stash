"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_query_1 = require("react-query");
const react_router_dom_1 = require("react-router-dom");
const recipe_services_1 = require("../services/recipe-services");
const App_1 = require("./App");
const Dashboard_1 = __importDefault(require("./Dashboard/Dashboard"));
const Recipe_1 = __importDefault(require("./Recipe/Recipe"));
const Spinner_1 = require("./Spinner");
var RecipeCategories;
(function (RecipeCategories) {
    RecipeCategories["Other"] = "Other";
    RecipeCategories["Lunch"] = "Lunch";
    RecipeCategories["Dessert"] = "Dessert";
    RecipeCategories["Breakfast"] = "Breakfast";
    RecipeCategories["Drinks"] = "Drinks";
    RecipeCategories["SideDish"] = "Side Dish";
    RecipeCategories["Dinner"] = "Dinner";
})(RecipeCategories || (RecipeCategories = {}));
const determineRecipeCategory = (recipeCategory) => {
    if (recipeCategory === RecipeCategories.Other) {
        return 'other';
    }
    else if (recipeCategory === RecipeCategories.Lunch) {
        return 'lunch';
    }
    else if (recipeCategory === RecipeCategories.Dessert) {
        return 'dessert';
    }
    else if (recipeCategory === RecipeCategories.Breakfast) {
        return 'breakfast';
    }
    else if (recipeCategory === RecipeCategories.Drinks) {
        return 'drinks';
    }
    else if (recipeCategory === RecipeCategories.SideDish) {
        return 'side_dish';
    }
    else if (recipeCategory === RecipeCategories.Dinner) {
        return 'dinner';
    }
    else {
        return '';
    }
};
const RecipeCache = () => {
    const { mutateAsync } = (0, react_query_1.useMutation)('recipes', 
    // @ts-expect-error
    async (recipeInput) => {
        try {
            const newRecipe = await recipe_services_1.RecipeService.createRecipe(recipeInput.recipeInput, recipeInput.files);
            const recipe = await recipe_services_1.RecipeService.getRecipe(newRecipe.recipe_uuid);
            return recipe;
        }
        catch (err) {
            console.log(err);
        }
    }, {
        onSuccess: (newRecipe) => {
            App_1.queryClient.setQueryData('recipes', (currentRecipes) => {
                const recipeCategory = newRecipe.category || determineRecipeCategory(newRecipe.category);
                const updatedQueryState = {
                    ...currentRecipes,
                    [recipeCategory]: [
                        ...currentRecipes[recipeCategory],
                        newRecipe,
                    ].sort(recipe_services_1.RecipeService.sortByTitle),
                };
                return updatedQueryState;
            });
        },
        onError: (error) => {
            console.log('Recipe could not be created: ', error);
        },
    });
    const { refetch, isLoading, data } = (0, react_query_1.useQuery)('recipes', async () => {
        try {
            const result = await recipe_services_1.RecipeService.getRecipes();
            if (result.error) {
                return null;
            }
            else {
                return result;
            }
        }
        catch (error) {
            return error;
        }
    }, {
        staleTime: Infinity,
    });
    const fetchRecipes = async () => {
        const result = await refetch();
        return result.data;
    };
    const [snackBarOpen, setSnackBarOpen] = (0, react_1.useState)(false);
    const [snackBarMessage, setSnackBarMessage] = (0, react_1.useState)('');
    const params = (0, react_router_dom_1.useParams)();
    const openSnackBar = (message) => {
        setSnackBarOpen(true);
        setSnackBarMessage(message);
    };
    const closeSnackBar = () => {
        setSnackBarMessage('');
        setSnackBarOpen(false);
    };
    if (isLoading) {
        return (0, jsx_runtime_1.jsx)(Spinner_1.Spinner, {});
    }
    if (params.id) {
        return ((0, jsx_runtime_1.jsx)(Recipe_1.default, { openSnackBar: openSnackBar, addRecipeMutation: async (recipeInput) => await mutateAsync(recipeInput) }));
    }
    else {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Routes, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: ":id", element: (0, jsx_runtime_1.jsx)(Recipe_1.default, { openSnackBar: openSnackBar, addRecipeMutation: async (recipeInput) => await mutateAsync(recipeInput) }) }) }), (0, jsx_runtime_1.jsx)(Dashboard_1.default, { recipes: data, fetchRecipes: () => fetchRecipes(), addRecipeMutation: async (recipeInput) => await mutateAsync(recipeInput) }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackBarOpen, anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                    }, onClose: closeSnackBar, autoHideDuration: 3000, message: snackBarMessage }, 'bottom' + 'center')] }));
    }
};
exports.default = RecipeCache;
//# sourceMappingURL=RecipeCache.js.map