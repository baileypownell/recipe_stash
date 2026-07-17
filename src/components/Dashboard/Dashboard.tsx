import { TableRowsRoundedIcon } from '@icons';
import { ViewModuleRoundedIcon } from '@icons';

import {
  Box,
  Collapse,
  Stack,
  TextInput,
  SegmentedControl,
  Group,
  Skeleton,
  VisuallyHidden,
  Title,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
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
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 767.95);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 767.95);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box
      style={{
        border: `1px solid ${theme.other.app.borders.subtle}`,
        borderRadius: 8,
        background: mantineTheme.white,
        boxShadow: theme.other.app.shadows.panel,
        overflow: 'hidden',
      }}
    >
      <Group
        justify="space-between"
        style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${theme.other.app.borders.faint}`,
        }}
      >
        <Group gap="sm">
          <Skeleton width={4} height={24} radius={999} />
          <Skeleton width={110} height={20} />
        </Group>
        <Skeleton width={28} height={24} radius={999} />
      </Group>
      <Box
        style={
          gridView === GridView.Grid
            ? {
                display: 'grid',
                gridTemplateColumns: isNarrow
                  ? '1fr'
                  : 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: mantineTheme.spacing.md,
                padding: mantineTheme.spacing.md,
              }
            : {
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 10,
              }
        }
      >
        {Array.from({ length: gridView === GridView.Grid ? 8 : 10 }).map(
          (_, index) =>
            gridView === GridView.Grid ? (
              <Skeleton key={index} height={190} radius={8} />
            ) : (
              <Box
                key={index}
                style={{
                  width: '100%',
                  minHeight: 58,
                  display: 'grid',
                  gridTemplateColumns: '40px minmax(0, 1fr) 24px',
                  alignItems: 'center',
                  gap: mantineTheme.spacing.sm,
                  padding: '9px 10px',
                  border: '1px solid transparent',
                  borderRadius: 6,
                  background: mantineTheme.white,
                }}
              >
                <Skeleton width={36} height={36} radius={6} />
                <Box
                  style={{
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: mantineTheme.spacing.sm,
                    flexWrap: 'wrap',
                  }}
                >
                  <Skeleton width={index % 3 === 0 ? 180 : 132} height={18} />
                  <Group gap={6}>
                    <Skeleton width={74} height={22} radius={999} />
                    <Skeleton width={62} height={22} radius={999} />
                    {!isNarrow ? (
                      <Skeleton width={88} height={22} radius={999} />
                    ) : null}
                  </Group>
                </Box>
                <Skeleton width={18} height={18} radius={4} />
              </Box>
            ),
        )}
      </Box>
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
  const theme = useMantineTheme();
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 767.95);

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

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 767.95);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const totalRecipes = filteredRecipes
    ? Object.values(filteredRecipes).reduce(
        (total, recipes) => total + recipes.length,
        0,
      )
    : 0;

  return (
    <Box
      style={{
        minHeight: 'calc(100vh - 56px)',
        ...theme.other.app.surfaces.page,
        padding: '28px 16px 88px',
      }}
    >
      <Box style={{ width: '100%', maxWidth: 1180, margin: '0 auto' }}>
        <Stack gap="xl">
          <Group justify="space-between" align="end">
            <Stack gap={4}>
              <Title
                order={2}
                style={{
                  color: theme.other.app.palette.gray.main,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                Recipes
              </Title>
              <Text size="sm">
                {props.isLoading
                  ? 'Loading your recipe box...'
                  : `${totalRecipes} saved recipe${totalRecipes === 1 ? '' : 's'}`}
              </Text>
            </Stack>
          </Group>

          <Group
            justify={isNarrow ? 'flex-start' : 'space-between'}
            align="center"
            style={{
              position: isNarrow ? 'static' : 'sticky',
              top: 56,
              zIndex: 20,
              padding: 10,
              border: `1px solid ${theme.other.app.borders.subtle}`,
              borderRadius: 8,
              boxShadow: theme.other.app.shadows.toolbar,
              backdropFilter: 'blur(10px)',
              flexDirection: isNarrow ? 'column' : undefined,
              alignItems: isNarrow ? 'stretch' : 'center',
              gap: isNarrow ? 12 : undefined,
            }}
          >
            <Group
              gap="sm"
              justify={isNarrow ? 'space-between' : 'flex-start'}
              style={{
                flex: isNarrow ? undefined : 1,
                minWidth: 0,
                width: isNarrow ? '100%' : undefined,
              }}
            >
              <SegmentedControl
                size="sm"
                aria-label="Recipe view options (list or grid)"
                value={String(gridView)}
                onChange={(value) => toggleView(Number(value) as GridView)}
                style={{ flex: '0 0 auto' }}
                data={[
                  {
                    value: String(GridView.List),
                    label: (
                      <Group gap={4} wrap="nowrap">
                        <TableRowsRoundedIcon />
                        <VisuallyHidden>List view</VisuallyHidden>
                      </Group>
                    ),
                  },
                  {
                    value: String(GridView.Grid),
                    label: (
                      <Group gap={4} wrap="nowrap">
                        <ViewModuleRoundedIcon />
                        <VisuallyHidden>Grid view</VisuallyHidden>
                      </Group>
                    ),
                  },
                ]}
              />

              {isNarrow ? (
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
              ) : null}
            </Group>

            <TextInput
              aria-label="Filter by recipe name"
              placeholder="Filter by recipe name"
              size="sm"
              onChange={handleSearchChange}
              value={userInputSubject.getValue()}
              style={{ width: isNarrow ? '100%' : 'min(320px, 100%)' }}
            />

            {isNarrow ? null : (
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
            )}
          </Group>

          <Stack gap="xl" pt="xs">
            {props.isLoading ? <DashboardSkeleton gridView={gridView} /> : null}
            {!props.isLoading && filteredRecipes !== null
              ? Object.keys(mealCategories).map((mealCat) => {
                  const recipes = (
                    filteredRecipes as unknown as SortedRecipeInterface
                  )[mealCat];

                  if (!recipes?.length) {
                    return null;
                  }

                  return (
                    <Collapse
                      key={mealCat}
                      expanded={allFalse ? true : appliedCat[mealCat]}
                    >
                      <Category
                        title={mealCategories[mealCat]}
                        gridView={gridView}
                        recipes={recipes}
                      />
                    </Collapse>
                  );
                })
              : null}
          </Stack>
        </Stack>
      </Box>

      <AddRecipeButton addRecipe={addRecipe} />
    </Box>
  );
};

export default Dashboard;
