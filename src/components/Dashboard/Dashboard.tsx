import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';

import {
  Box,
  Collapse,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import type {
  BaseStringAccessibleObjectBoolean,
  BaseStringAccessibleObjectString,
  SortedRecipeInterface,
} from '../../services/recipe-services';
import { queryClient } from '../App';
import type { AddRecipeMutationParam } from '../RecipeCache';
import Category from './Category/Category';
import FilterMenu from './FilterMenu';
import { AddRecipeButton } from './AddRecipeButton';

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
  high_protein: boolean;
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
    high_protein: false,
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
  isLoading?: boolean;
  recipes?: SortedRecipeInterface;
}

const DashboardSkeleton = ({ gridView }: { gridView: GridView }) => {
  const theme = useTheme();

  return (
    <Box sx={{ paddingTop: 3.5 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1.25,
          marginBottom: 1.75,
        }}
      >
        <Skeleton width={4} height={24} borderRadius={4} />
        <Skeleton width={110} height={24} />
        <Skeleton width={28} height={22} borderRadius={4} />
      </Stack>
      <Stack
        direction={gridView === GridView.Grid ? 'row' : 'column'}
        sx={{
          flexWrap: gridView === GridView.Grid ? 'wrap' : 'nowrap',
          gap: gridView === GridView.Grid ? 2 : 0.75,
        }}
      >
        {Array.from({ length: gridView === GridView.Grid ? 8 : 10 }).map(
          (_, index) =>
            gridView === GridView.Grid ? (
              <Skeleton key={index} width={276} height={190} borderRadius={4} />
            ) : (
              <Stack
                key={index}
                direction="row"
                sx={{
                  alignItems: 'center',
                  gap: 1,
                  minHeight: 52,
                  py: 0.75,
                  px: 1,
                  border: theme.surfaces.quiet.border,
                  backgroundColor: '#fff',
                }}
              >
                <Skeleton width={32} height={32} borderRadius={4} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton width="42%" height={18} />
                </Box>
                <Skeleton width={24} height={24} borderRadius={12} />
              </Stack>
            ),
        )}
      </Stack>
    </Box>
  );
};

const Dashboard = (props: Props) => {
  const [filteredRecipes, setFilteredRecipes] =
    useState<SortedRecipeInterface | null>(null);
  const [gridView, setGridView] = useState(() => {
    const savedGridView = Number(window.localStorage.getItem('gridView'));
    return savedGridView === GridView.List ? GridView.List : GridView.Grid;
  });
  const [selectedFiltersNum, setSelectedFiltersNum] = useState(0);
  const theme = useTheme();

  const addRecipe = async (recipeInput: AddRecipeMutationParam) => {
    await props.addRecipeMutation(recipeInput);
    const current = queryClient.getQueryData(
      'recipes',
    ) as SortedRecipeInterface;
    unfilteredRecipesSubject.next(current);
  };

  useEffect(() => {
    if (props.isLoading || !props.recipes) {
      return;
    }

    unfilteredRecipesSubject.next(props.recipes);

    const userInputSaved = window.sessionStorage.getItem('userInput');
    if (userInputSaved) {
      userInputSubject.next(userInputSaved);
    }

    const userFiltersSaved = JSON.parse(
      window.sessionStorage.getItem('feature_filters') as string,
    );
    if (userFiltersSaved) {
      appliedFiltersSubject.next(userFiltersSaved);
    }

    const userCategoryFiltersSaved: CategoryInterface = JSON.parse(
      window.sessionStorage.getItem('category_filters') as string,
    );
    if (userCategoryFiltersSaved) {
      appliedCategorySubject.next(userCategoryFiltersSaved);
    }

    const subscription = combineLatest([
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

    return () => subscription.unsubscribe();
  }, [props.isLoading, props.recipes]);

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

  return (
    <Box
      sx={{
        padding: 1,
        [theme.breakpoints.up('lg')]: {
          paddingRight: 3,
          paddingLeft: 3,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'start', sm: 'center' },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0, sm: 2 }}
          sx={{
            alignItems: { xs: 'start', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            aria-label="Recipe view options (list or grid)"
            value={gridView}
            onChange={(_, val) => toggleView(val)}
          >
            <ToggleButton disableRipple value={GridView.List} aria-label="List view">
              <TableRowsRoundedIcon />
            </ToggleButton>
            <ToggleButton disableRipple value={GridView.Grid} aria-label="Grid view">
              <ViewModuleRoundedIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Filter by recipe name"
            aria-label="Filter by recipe name"
            placeholder="Type to search..."
            variant="standard"
            size="small"
            onChange={handleSearchChange}
            value={userInputSubject.getValue()}
            sx={{
              m: 1,
              width: { xs: '100%', md: 300 },
            }}
            slotProps={{
              input: {
                size: 'small',
              },
            }}
          />
        </Stack>

        <FilterMenu
          numberOfSelectedFilters={selectedFiltersNum}
          filters={filterArray}
          appliedFilt={appliedFilt}
          appliedCat={appliedCat}
          filter={filter}
          filterByCategory={filterByCategory}
          categories={filterCategoryArray}
          clearFilters={clearFilters}
        />
      </Stack>
      {props.isLoading ? <DashboardSkeleton gridView={gridView} /> : null}
      {!props.isLoading && filteredRecipes !== null
        ? Object.keys(mealCategories).map((mealCat) => (
            <Collapse key={mealCat} in={allFalse ? true : appliedCat[mealCat]}>
              <Category
                title={mealCategories[mealCat]}
                gridView={gridView}
                recipes={
                  (filteredRecipes as unknown as SortedRecipeInterface)[mealCat]
                }
              />
            </Collapse>
          ))
        : null}

      <AddRecipeButton addRecipe={addRecipe} />
    </Box>
  );
};

export default Dashboard;
