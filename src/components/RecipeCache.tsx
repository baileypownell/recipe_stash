import { Snackbar } from '@mui/material';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Route, Routes, useParams } from 'react-router-dom';
import { FullRecipe, RawRecipe } from '../../server/recipe';
import { NewFile } from '../models/images';
import {
  RecipeInput,
  RecipeService,
  SortedRecipeInterface,
} from '../services/recipe-services';
import { queryClient } from './App';
import Dashboard from './Dashboard/Dashboard';
import Recipe from './Recipe/Recipe';
import { Spinner } from './Spinner';

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
  files: NewFile[];
  defaultTile: string | null;
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
  }
};

const RecipeCache = () => {
  const { mutateAsync } = useMutation(
    'recipes',
    async (recipeInput: AddRecipeMutationParam) => {
      try {
        const newRecipe: RawRecipe = await RecipeService.createRecipe(
          recipeInput.recipeInput,
          recipeInput.files,
          recipeInput.defaultTile,
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
        queryClient.setQueryData(
          'recipes',
          (currentRecipes: SortedRecipeInterface) => {
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
          },
        );
      },
      onError: (error) => {
        console.log('Recipe could not be created: ', error);
      },
    },
  );

  const { refetch, isLoading, error, data } = useQuery(
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

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const params = useParams();

  const openSnackBar = (message: string) => {
    setSnackBarOpen(true);
    setSnackBarMessage(message);
  };

  const closeSnackBar = () => {
    setSnackBarMessage('');
    setSnackBarOpen(false);
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (params.id) {
    return (
      <Recipe
        openSnackBar={openSnackBar}
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
                openSnackBar={openSnackBar}
                addRecipeMutation={async (
                  recipeInput: AddRecipeMutationParam,
                ) => await mutateAsync(recipeInput)}
              />
            }
          />
        </Routes>
        <Dashboard
          recipes={data}
          fetchRecipes={() => fetchRecipes()}
          addRecipeMutation={async (recipeInput: AddRecipeMutationParam) =>
            await mutateAsync(recipeInput)
          }
        />
        <Snackbar
          open={snackBarOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          onClose={closeSnackBar}
          autoHideDuration={3000}
          message={snackBarMessage}
          key={'bottom' + 'center'}
        />
      </>
    );
  }
};

export default RecipeCache;
