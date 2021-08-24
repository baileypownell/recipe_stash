
import React from 'react'
import { useQuery, useMutation } from 'react-query'
import BounceLoader from 'react-spinners/BounceLoader'
import { Redirect } from 'react-router-dom'
import { Dashboard, Recipe } from '..'
import { SortedRecipeInterface, RecipeService, RecipeInput, NewFileInterface, DefaultTile } from '../../services/recipe-services'
import { queryClient } from '../..'
import { RawRecipe, FullRecipe } from '../../../server/recipe'
export interface MealCategoriesType {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  side_dish: 'Side Dish',
  dessert: 'Dessert',
  drinks: 'Drinks',
  other: 'Other',
}

export interface AddRecipeMutationParam {
  recipeInput: RecipeInput,
  files: NewFileInterface[],
  defaultTile: DefaultTile | null
}

interface RecipeCacheProps {
  dashboard?: boolean
  individualRecipe?: boolean
}

enum RecipeCategories {
  Other = 'Other',
  Lunch = 'Lunch',
  Dessert = 'Dessert',
  Breakfast = 'Breakfast',
  Drinks = 'Drinks',
  SideDish = 'Side Dish',
  Dinner = 'Dinner'
}

const determineRecipeCategory = (recipeCategory: string): string => {
  if (recipeCategory === RecipeCategories.Other) {
    return 'other'
  } else if (recipeCategory === RecipeCategories.Lunch) {
    return 'lunch'
  } else if (recipeCategory === RecipeCategories.Dessert) {
    return 'dessert'
  } else if (recipeCategory === RecipeCategories.Breakfast) {
    return 'breakfast'
  } else if (recipeCategory === RecipeCategories.Drinks) {
    return 'drinks'
  } else if (recipeCategory === RecipeCategories.SideDish) {
    return 'side_dish'
  } else if (recipeCategory === RecipeCategories.Dinner) {
    return 'dinner'
  }
}

function RecipeCache (props: RecipeCacheProps) {
  const { mutateAsync } = useMutation('recipes', async (recipeInput: AddRecipeMutationParam) => {
    try {
      const newRecipe: RawRecipe = await RecipeService.createRecipe(
        recipeInput.recipeInput, recipeInput.files, recipeInput.defaultTile
      )
      console.log('newRecipe ', newRecipe)
      const recipe: FullRecipe = await RecipeService.getRecipe(newRecipe.recipe_uuid)
      return recipe
    } catch (err) {
      console.log(err)
      M.toast({ html: 'There was an error.' })
    }
  }, {
    onSuccess: (newRecipe: FullRecipe) => {
      queryClient.setQueryData('recipes', (currentRecipes: SortedRecipeInterface) => {
        const recipeCategory: string = newRecipe.category || determineRecipeCategory(newRecipe.category)
        const updatedQueryState = {
          ...currentRecipes,
          [recipeCategory]: [...currentRecipes[recipeCategory], newRecipe].sort(RecipeService.sortByTitle)
        }
        return updatedQueryState
      })
    }
  })

  const { refetch, isLoading, error, data } = useQuery('recipes', async () => {
    try {
      const recipes: SortedRecipeInterface = await RecipeService.getRecipes()
      return recipes
    } catch (error) {
      return error
    }
  }, {
    staleTime: Infinity
  })

  const fetchRecipes = async () => {
    const result = await refetch()
    return result.data
  }

  if (isLoading) {
    return <div className="BounceLoader">
      <BounceLoader
        size={100}
        color={'#689943'}
      />
    </div>
  }

  if (error?.response?.status === 401) return <Redirect to="/login"></Redirect>

  if (props.dashboard) {
    return (
      <Dashboard
        recipes={data}
        fetchRecipes={() => fetchRecipes()}
        addRecipeMutation={async (recipeInput: AddRecipeMutationParam) => await mutateAsync(recipeInput)}>
      </Dashboard>
    )
  }

  if (props.individualRecipe) {
    return (
      <Recipe addRecipeMutation={async (recipeInput: AddRecipeMutationParam) => await mutateAsync(recipeInput)}></Recipe>
    )
  }
}

export default RecipeCache
