"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const SearchRounded_1 = __importDefault(require("@mui/icons-material/SearchRounded"));
const TableRowsRounded_1 = __importDefault(require("@mui/icons-material/TableRowsRounded"));
const ViewModuleRounded_1 = __importDefault(require("@mui/icons-material/ViewModuleRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const App_1 = require("../App");
const Category_1 = __importDefault(require("./Category/Category"));
const FilterMenu_1 = __importDefault(require("./FilterMenu"));
var GridView;
(function (GridView) {
    GridView[GridView["Grid"] = 0] = "Grid";
    GridView[GridView["List"] = 1] = "List";
})(GridView || (exports.GridView = GridView = {}));
const mealCategories = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    side_dish: 'Side Dish',
    dessert: 'Dessert',
    drinks: 'Drinks',
    other: 'Other',
};
const userInputSubject = new rxjs_1.BehaviorSubject('');
const userInput$ = userInputSubject.asObservable();
const appliedFiltersSubject = new rxjs_1.BehaviorSubject({
    dairy_free: false,
    easy: false,
    gluten_free: false,
    healthy: false,
    keto: false,
    no_bake: false,
    sugar_free: false,
    vegan: false,
    vegetarian: false,
    high_protein: false,
});
const appliedFilters$ = appliedFiltersSubject.asObservable();
const appliedCategorySubject = new rxjs_1.BehaviorSubject({
    breakfast: false,
    lunch: false,
    dinner: false,
    side_dish: false,
    dessert: false,
    drinks: false,
    other: false,
});
const appliedCategory$ = appliedCategorySubject.asObservable();
const unfilteredRecipesSubject = new rxjs_1.BehaviorSubject(null);
const unfilteredRecipes$ = unfilteredRecipesSubject.asObservable();
const Dashboard = (props) => {
    const [filteredRecipes, setFilteredRecipes] = (0, react_1.useState)(null);
    const [gridView, setGridView] = (0, react_1.useState)(GridView.Grid);
    const [selectedFiltersNum, setSelectedFiltersNum] = (0, react_1.useState)(0);
    const theme = (0, material_1.useTheme)();
    const addRecipe = async (recipeInput) => {
        await props.addRecipeMutation(recipeInput);
        const current = App_1.queryClient.getQueryData('recipes');
        unfilteredRecipesSubject.next(current);
    };
    (0, react_1.useEffect)(() => {
        unfilteredRecipesSubject.next(props.recipes);
        const userInputSaved = window.sessionStorage.getItem('userInput');
        if (userInputSaved) {
            userInputSubject.next(userInputSaved);
        }
        // using saved features filter
        const userFiltersSaved = JSON.parse(window.sessionStorage.getItem('feature_filters'));
        if (userFiltersSaved) {
            appliedFiltersSubject.next(userFiltersSaved);
        }
        // using saved categories filter
        const userCategoryFiltersSaved = JSON.parse(window.sessionStorage.getItem('category_filters'));
        if (userCategoryFiltersSaved) {
            appliedCategorySubject.next(userCategoryFiltersSaved);
        }
        // set gridView
        const gridView = JSON.parse(window.localStorage.getItem('gridView'));
        setGridView(gridView);
        (0, rxjs_1.combineLatest)([
            appliedFilters$,
            appliedCategory$,
            userInput$,
            unfilteredRecipes$,
        ])
            .pipe((0, operators_1.tap)(([filters, category, input]) => {
            window.sessionStorage.setItem('feature_filters', JSON.stringify(filters));
            window.sessionStorage.setItem('category_filters', JSON.stringify(category));
            window.sessionStorage.setItem('userInput', input);
        }))
            .subscribe(([filters, , input, recipes]) => {
            const newFilteredRecipesState = {};
            for (const category in recipes) {
                const filteredCategory = recipes[category].filter((recipe) => recipe.title.toLowerCase().includes(input));
                newFilteredRecipesState[category] = filteredCategory;
            }
            const selectedTags = [];
            for (const tag in filters) {
                if (filters[tag]) {
                    selectedTags.push(tag);
                }
            }
            if (selectedTags.length) {
                // limit to only those recipes whose tags include each checked result from res (true)
                for (const category in newFilteredRecipesState) {
                    const filteredCategory = newFilteredRecipesState[category]
                        .filter((recipe) => recipe.tags.length >= 1)
                        .filter((recipe) => selectedTags.every((tag) => recipe.tags.includes(tag)));
                    newFilteredRecipesState[category] = filteredCategory;
                }
            }
            setFilteredRecipes(newFilteredRecipesState);
        });
    }, []);
    (0, react_1.useEffect)(() => {
        let selectedFilters = 0;
        for (const property in appliedFiltersSubject.getValue()) {
            if (appliedFiltersSubject.getValue()[property]) {
                selectedFilters++;
            }
        }
        for (const property in appliedCategorySubject.getValue()) {
            if (appliedCategorySubject.getValue()[property]) {
                selectedFilters++;
            }
        }
        setSelectedFiltersNum(selectedFilters);
    }, [appliedFiltersSubject.getValue(), appliedCategorySubject.getValue()]);
    const filter = (key) => {
        const currentState = appliedFiltersSubject.getValue()[key];
        const filter = {
            ...appliedFiltersSubject.getValue(),
            [key]: !currentState,
        };
        appliedFiltersSubject.next(filter);
    };
    const filterByCategory = (key) => {
        const currentState = appliedCategorySubject.getValue()[key];
        const filter = {
            ...appliedCategorySubject.getValue(),
            [key]: !currentState,
        };
        appliedCategorySubject.next(filter);
    };
    const handleSearchChange = (e) => {
        const input = e.target.value.toLowerCase();
        userInputSubject.next(input);
    };
    const toggleView = (gridView) => {
        setGridView(gridView);
        window.localStorage.setItem('gridView', gridView.toString());
    };
    const appliedFilt = appliedFiltersSubject.getValue();
    const appliedCat = appliedCategorySubject.getValue();
    let allFalse = true;
    for (const [, cat] of Object.entries(appliedCat).entries()) {
        if (cat[1]) {
            allFalse = false;
            break;
        }
    }
    const filterArray = [
        { key: 'dairy_free', name: 'Dairy Free' },
        { key: 'easy', name: 'Easy' },
        { key: 'gluten_free', name: 'Gluten Free' },
        { key: 'healthy', name: 'Healthy' },
        { key: 'keto', name: 'Keto' },
        { key: 'no_bake', name: 'No Bake' },
        { key: 'sugar_free', name: 'Sugar Free' },
        { key: 'vegan', name: 'Vegan' },
        { key: 'vegetarian', name: 'Vegetarian' },
        { key: 'high_protein', name: 'High Protein' },
    ];
    const filterCategoryArray = [
        { key: 'breakfast', name: mealCategories.breakfast },
        { key: 'lunch', name: mealCategories.lunch },
        { key: 'dinner', name: mealCategories.dinner },
        { key: 'side_dish', name: mealCategories.side_dish },
        { key: 'dessert', name: mealCategories.dessert },
        { key: 'drinks', name: mealCategories.drinks },
        { key: 'other', name: mealCategories.other },
    ];
    const clearFilters = () => {
        appliedFiltersSubject.next({
            dairy_free: false,
            easy: false,
            gluten_free: false,
            healthy: false,
            keto: false,
            no_bake: false,
            sugar_free: false,
            vegan: false,
            vegetarian: false,
            high_protein: false,
        });
        appliedCategorySubject.next({
            breakfast: false,
            lunch: false,
            dinner: false,
            side_dish: false,
            dessert: false,
            drinks: false,
            other: false,
        });
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { backgroundColor: theme.palette.secondary.main }, padding: 0.5, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { label: "Find a recipe", variant: "filled", size: "small", onChange: handleSearchChange, value: userInputSubject.getValue(), sx: {
                                m: 1,
                                width: '25ch',
                                input: {
                                    color: 'white',
                                },
                                'label, svg': {
                                    color: 'white!important',
                                },
                            }, InputProps: {
                                endAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "end", children: (0, jsx_runtime_1.jsx)(SearchRounded_1.default, {}) })),
                            } }), (0, jsx_runtime_1.jsx)(FilterMenu_1.default, { numberOfSelectedFilters: selectedFiltersNum, filters: filterArray, appliedFilt: appliedFilt, appliedCat: appliedCat, filter: filter, filterByCategory: filterByCategory, categories: filterCategoryArray, clearFilters: clearFilters })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                    margin: '0 auto',
                    width: '90%',
                    padding: '25px 0',
                    [theme.breakpoints.up('lg')]: {
                        padding: '2vw 0',
                    },
                }, children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => toggleView(GridView.List), children: (0, jsx_runtime_1.jsx)(TableRowsRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => toggleView(GridView.Grid), children: (0, jsx_runtime_1.jsx)(ViewModuleRounded_1.default, {}) }), filteredRecipes !== null
                        ? Object.keys(mealCategories).map((mealCat) => ((0, jsx_runtime_1.jsx)(material_1.Collapse, { in: allFalse ? true : appliedCat[mealCat], children: (0, jsx_runtime_1.jsx)(Category_1.default, { title: mealCategories[mealCat], id: mealCat, gridView: gridView, recipes: filteredRecipes[mealCat], addRecipe: addRecipe }) }, mealCat)))
                        : null] })] }));
};
exports.default = Dashboard;
//# sourceMappingURL=Dashboard.js.map