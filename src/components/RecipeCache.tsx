import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from 'react-query';
import { Route, Routes, useParams } from 'react-router-dom';
import {
  RecipeService,
} from '../services/recipe-services';
import type {
  RecipeInput,
  SortedRecipeInterface,
} from '../services/recipe-services';
import { queryClient } from './App';
import Dashboard from './Dashboard/Dashboard';
import Recipe from './Recipe/Recipe';
import type { NewFileUpload } from '../models/images';
import type { FullRecipe, RawRecipe } from '../../shared/types';

export interface MealCategoriesType {
  breakfast: 'Breakfast';
  lunch: 'Lunch';
  dinner: 'Dinner';
  side_dish: 'Side Dish';
  dessert: 'Dessert';
  drinks: 'Drinks';
  other: 'Other';
}

export interface AddRecipeMutationParam {
  recipeInput: RecipeInput;
  files: NewFileUpload[];
}

enum RecipeCategories {
  Other = 'Other',
  Lunch = 'Lunch',
  Dessert = 'Dessert',
  Breakfast = 'Breakfast',
  Drinks = 'Drinks',
  SideDish = 'Side Dish',
  Dinner = 'Dinner',
}

const determineRecipeCategory = (recipeCategory: string): string => {
  if (recipeCategory === RecipeCategories.Other) {
    return 'other';
  } else if (recipeCategory === RecipeCategories.Lunch) {
    return 'lunch';
  } else if (recipeCategory === RecipeCategories.Dessert) {
    return 'dessert';
  } else if (recipeCategory === RecipeCategories.Breakfast) {
    return 'breakfast';
  } else if (recipeCategory === RecipeCategories.Drinks) {
    return 'drinks';
  } else if (recipeCategory === RecipeCategories.SideDish) {
    return 'side_dish';
  } else if (recipeCategory === RecipeCategories.Dinner) {
    return 'dinner';
  } else {
    return '';
  }
};

const RecipeCache = () => {
  const { mutateAsync } = useMutation(
    'recipes',
    // @ts-expect-error
    async (recipeInput: AddRecipeMutationParam) => {
      try {
        const newRecipe: RawRecipe = await RecipeService.createRecipe(
          recipeInput.recipeInput,
          recipeInput.files,
        );
        const recipe: FullRecipe = await RecipeService.getRecipe(
          newRecipe.recipe_uuid,
        );
        return recipe;
      } catch (err) {
        console.log(err);
      }
    },
    {
      onSuccess: (newRecipe: FullRecipe) => {
        queryClient.setQueryData('recipes', (currentRecipes: any) => {
          const recipeCategory: string =
            newRecipe.category || determineRecipeCategory(newRecipe.category);
          const updatedQueryState = {
            ...currentRecipes,
            [recipeCategory]: [
              ...currentRecipes[recipeCategory],
              newRecipe,
            ].sort(RecipeService.sortByTitle),
          };
          return updatedQueryState;
        });
      },
      onError: (error) => {
        console.log('Recipe could not be created: ', error);
      },
    },
  );

  const { refetch, isLoading, data } = useQuery(
    'recipes',
    async () => {
      try {
        const result:
          | SortedRecipeInterface
          | { error: boolean; errorMessage: string } =
          await RecipeService.getRecipes();
        if (result.error) {
          return null;
        } else {
          return result;
        }
      } catch (error) {
        return error;
      }
    },
    {
      staleTime: Infinity,
    },
  );

  const fetchRecipes = async () => {
    const result = await refetch();
    return result.data;
  };

  const params = useParams();

  const showNotification = (message: string) => {
    notifications.show({ message });
  };

  if (params.id) {
    return (
      <Recipe
        openSnackBar={showNotification}
        addRecipeMutation={async (recipeInput: AddRecipeMutationParam) =>
          await mutateAsync(recipeInput)
        }
      />
    );
  } else {
    return (
      <>
        <Routes>
          <Route
            path=":id"
            element={
              <Recipe
                openSnackBar={showNotification}
                addRecipeMutation={async (
                  recipeInput: AddRecipeMutationParam,
                ) => await mutateAsync(recipeInput)}
              />
            }
          />
        </Routes>
        <Dashboard
          isLoading={isLoading}
          recipes={data as SortedRecipeInterface}
          fetchRecipes={() => fetchRecipes()}
          addRecipeMutation={async (recipeInput: AddRecipeMutationParam) =>
            await mutateAsync(recipeInput)
          }
        />
      </>
    );
  }
};

export default RecipeCache;
