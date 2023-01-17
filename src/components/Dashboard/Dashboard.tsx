import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import {
  Box,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  BaseStringAccessibleObjectBoolean,
  BaseStringAccessibleObjectString,
  SortedRecipeInterface,
} from '../../services/recipe-services';
import { queryClient } from '../App';
import { AddRecipeMutationParam } from '../RecipeCache/RecipeCache';
import Category from './Category/Category';
import './Dashboard.scss';
import FilterMenu from './FilterMenu';

export enum GridView {
  Grid,
  List,
}

interface MealCategoriesInterface extends BaseStringAccessibleObjectString {
  breakfast: string;
  lunch: string;
  dinner: string;
  side_dish: string;
  dessert: string;
  drinks: string;
  other: string;
}

export type MealCategoriesType = {
  breakfast: 'Breakfast';
  lunch: 'Lunch';
  dinner: 'Dinner';
  side_dish: 'Side Dish';
  dessert: 'Dessert';
  drinks: 'Drinks';
  other: 'Other';
};

const mealCategories: MealCategoriesInterface = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  side_dish: 'Side Dish',
  dessert: 'Dessert',
  drinks: 'Drinks',
  other: 'Other',
};

const userInputSubject: BehaviorSubject<string> = new BehaviorSubject('');
const userInput$ = userInputSubject.asObservable();

interface FilterInterface extends BaseStringAccessibleObjectBoolean {
  dairy_free: boolean;
  easy: boolean;
  gluten_free: boolean;
  healthy: boolean;
  keto: boolean;
  no_bake: boolean;
  sugar_free: boolean;
  vegan: boolean;
  vegetarian: boolean;
}

interface CategoryInterface extends BaseStringAccessibleObjectBoolean {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  side_dish: boolean;
  dessert: boolean;
  drinks: boolean;
  other: boolean;
}

const appliedFiltersSubject: BehaviorSubject<FilterInterface> =
  new BehaviorSubject<FilterInterface>({
    dairy_free: false,
    easy: false,
    gluten_free: false,
    healthy: false,
    keto: false,
    no_bake: false,
    sugar_free: false,
    vegan: false,
    vegetarian: false,
  });
const appliedFilters$ = appliedFiltersSubject.asObservable();

const appliedCategorySubject: BehaviorSubject<CategoryInterface> =
  new BehaviorSubject<CategoryInterface>({
    breakfast: false,
    lunch: false,
    dinner: false,
    side_dish: false,
    dessert: false,
    drinks: false,
    other: false,
  });
const appliedCategory$ = appliedCategorySubject.asObservable();

const unfilteredRecipesSubject: BehaviorSubject<null | SortedRecipeInterface> =
  new BehaviorSubject<null | SortedRecipeInterface>(null);
const unfilteredRecipes$ = unfilteredRecipesSubject.asObservable();

interface Props {
  addRecipeMutation: any;
  fetchRecipes: Function;
  recipes: SortedRecipeInterface;
}

const Dashboard = (props: Props) => {
  const [filteredRecipes, setFilteredRecipes] = useState(null);
  const [gridView, setGridView] = useState(GridView.Grid);
  const [selectedFiltersNum, setSelectedFiltersNum] = useState(0);

  const addRecipe = async (recipeInput: AddRecipeMutationParam) => {
    await props.addRecipeMutation(recipeInput);
    const current: SortedRecipeInterface = queryClient.getQueryData('recipes');
    unfilteredRecipesSubject.next(current);
  };

  useEffect(() => {
    unfilteredRecipesSubject.next(props.recipes);

    const userInputSaved = window.sessionStorage.getItem('userInput');
    if (userInputSaved) {
      userInputSubject.next(userInputSaved);
    }

    // using saved features filter
    const userFiltersSaved = JSON.parse(
      window.sessionStorage.getItem('feature_filters') as string,
    );
    if (userFiltersSaved) {
      appliedFiltersSubject.next(userFiltersSaved);
    }

    // using saved categories filter
    const userCategoryFiltersSaved: CategoryInterface = JSON.parse(
      window.sessionStorage.getItem('category_filters') as string,
    );
    if (userCategoryFiltersSaved) {
      appliedCategorySubject.next(userCategoryFiltersSaved);
    }

    // set gridView
    const gridView = JSON.parse(
      window.localStorage.getItem('gridView') as string,
    );
    setGridView(gridView);

    combineLatest([
      appliedFilters$,
      appliedCategory$,
      userInput$,
      unfilteredRecipes$,
    ])
      .pipe(
        tap(([filters, category, input]) => {
          window.sessionStorage.setItem(
            'feature_filters',
            JSON.stringify(filters),
          );
          window.sessionStorage.setItem(
            'category_filters',
            JSON.stringify(category),
          );
          window.sessionStorage.setItem('userInput', input);
        }),
      )
      .subscribe(([filters, , input, recipes]) => {
        const newFilteredRecipesState: SortedRecipeInterface = {} as any;
        for (const category in recipes) {
          const filteredCategory = recipes[category].filter((recipe) =>
            recipe.title.toLowerCase().includes(input),
          );
          newFilteredRecipesState[category] = filteredCategory;
        }

        const selectedTags: string[] = [];
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
              .filter((recipe) =>
                selectedTags.every((tag) => recipe.tags.includes(tag as any)),
              );
            newFilteredRecipesState[category] = filteredCategory;
          }
        }

        setFilteredRecipes(newFilteredRecipesState);
      });
  }, []);

  useEffect(() => {
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

  const filter = (key: string): void => {
    const currentState = appliedFiltersSubject.getValue()[key];
    const filter = {
      ...appliedFiltersSubject.getValue(),
      [key]: !currentState,
    };
    appliedFiltersSubject.next(filter);
  };

  const filterByCategory = (key: string) => {
    const currentState = appliedCategorySubject.getValue()[key];
    const filter: CategoryInterface = {
      ...appliedCategorySubject.getValue(),
      [key]: !currentState,
    };
    appliedCategorySubject.next(filter);
  };

  const handleSearchChange = (e: {
    target: EventTarget | HTMLInputElement;
  }) => {
    const input = (e.target as HTMLInputElement).value.toLowerCase();
    userInputSubject.next(input);
  };

  const toggleView = (gridView: GridView) => {
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

  return (
    <Box>
      <Box className="title-bar">
        <Box>
          <Typography variant="h5">Recipe Box</Typography>
          <Stack direction="row" alignItems="center">
            <TextField
              label="Find a recipe"
              variant="filled"
              onChange={handleSearchChange}
              value={userInputSubject.getValue()}
              sx={{
                m: 1,
                width: '25ch',
                input: {
                  color: 'white',
                },
                'label, svg': {
                  color: 'white!important',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FilterMenu
              numberOfSelectedFilters={selectedFiltersNum}
              filters={filterArray}
              appliedFilt={appliedFilt}
              appliedCat={appliedCat}
              filter={filter}
              filterByCategory={filterByCategory}
              categories={filterCategoryArray}
            />
          </Stack>
        </Box>
      </Box>

      <Box className="dashboard">
        <IconButton color="gray" onClick={() => toggleView(GridView.List)}>
          <TableRowsRoundedIcon />
        </IconButton>
        <IconButton color="gray" onClick={() => toggleView(GridView.Grid)}>
          <ViewModuleRoundedIcon />
        </IconButton>
        {filteredRecipes !== null
          ? Object.keys(mealCategories).map((mealCat) => (
              <Collapse
                key={mealCat}
                in={allFalse ? true : appliedCat[mealCat]}
              >
                <Category
                  title={mealCategories[mealCat]}
                  id={mealCat}
                  gridView={gridView}
                  recipes={
                    (filteredRecipes as unknown as SortedRecipeInterface)[
                      mealCat
                    ]
                  }
                  addRecipe={addRecipe}
                ></Category>
              </Collapse>
            ))
          : null}
      </Box>
    </Box>
  );
};

export default Dashboard;
