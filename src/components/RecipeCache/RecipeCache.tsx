
import React from 'react'
import { useQuery, useMutation } from 'react-query'
export interface MealCategoriesType {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  side_dish: 'Side Dish',
  dessert: 'Dessert', 
  drinks: 'Drinks', 
  other: 'Other',
}

export interface DashboardReadyRecipe {
  category: string 
  defaultTileImageKey: boolean 
  directions: string 
  id: string 
  ingredients: string 
  preSignedDefaultTileImageUrl?: string 
  rawTitle: string 
  tags: string[] 
  title: string
}

export interface AddRecipeMutationParam {
  recipeInput: RecipeInput, 
  files: NewFileInterface[], 
  defaultTile: DefaultTile | null
}
import BounceLoader from "react-spinners/BounceLoader"
import { Redirect } from 'react-router-dom'
import { Dashboard, Recipe } from '..'
import { SortedRecipeInterface, RecipeService, RecipeInput, NewFileInterface, DefaultTile } from '../../services/recipe-services'
import { queryClient } from '../..'
import { query } from 'express'

interface RecipeCacheProps {
  dashboard?: boolean
  individualRecipe?: boolean
}
 
const determineRecipeCategory = (recipeCategory: string): string => {
  if (recipeCategory === 'Other') {
    return 'other'
  } else if (recipeCategory === 'Lunch') {
    return 'lunch'
  } else if (recipeCategory === 'Dessert') {
    return 'dessert'
  } else if (recipeCategory === 'Breakfast') {
    return 'breakfast'
  } else if (recipeCategory === 'Drinks') {
    return 'drinks'
  } else if (recipeCategory === 'Side Dish') {
    return 'side_dish'
  } else if (recipeCategory === 'Dinner') {
    return 'dinner'
  }
}

 function RecipeCache(props: RecipeCacheProps) {
    const { mutateAsync } = useMutation('recipes', async(recipeInput: AddRecipeMutationParam) => {
      try {
        const newRecipe: {recipeAdded: boolean, recipe: any} = await RecipeService.createRecipe(
          recipeInput.recipeInput, recipeInput.files, recipeInput.defaultTile
        )
        const recipe: DashboardReadyRecipe = await RecipeService.getRecipe(newRecipe.recipe.recipe_uuid)
        console.log(recipe) 
        return recipe
      } catch(err) {
        console.log(err)
        M.toast({html: 'There was an error.'})
    }}, {
      onSuccess: (newRecipe: any) => {
        queryClient.setQueryData('recipes', (currentRecipes: SortedRecipeInterface) => {
          let recipeCategory: string = newRecipe.category || determineRecipeCategory(newRecipe.category)          
          const updatedQueryState = {
            ...currentRecipes, 
            [recipeCategory]: [...currentRecipes[recipeCategory], newRecipe].sort(RecipeService.sortByTitle)
          }
          return updatedQueryState
        })
      }
    })

    const { refetch, isLoading, error, data } = useQuery('recipes', async() => {
      try {
          let recipes: SortedRecipeInterface = await RecipeService.getRecipes()
          return recipes
        } catch (error) {
          return error
        }
      }, {
        staleTime: Infinity
      })

    const fetchRecipes = async() => {
      const result = await refetch() 
      return result.data
    }
  
    if (isLoading) return <div className="BounceLoader">
      <BounceLoader
        size={100}
        color={"#689943"}
      />
    </div>
  
    if (error?.response?.status === 401) return <Redirect to="/login"></Redirect>
  
    if (props.dashboard) return (
      <Dashboard 
        recipes={data}
        fetchRecipes={() => fetchRecipes()} 
        addRecipeMutation={async(recipeInput: AddRecipeMutationParam) => await mutateAsync(recipeInput)}>
      </Dashboard>
    )

    if (props.individualRecipe) return (
      <Recipe addRecipeMutation={async(recipeInput: AddRecipeMutationParam) => await mutateAsync(recipeInput)}></Recipe>
    )
  }
 
  export default RecipeCache;