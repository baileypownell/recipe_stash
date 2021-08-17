
import React from 'react'
import { useQuery, useMutation } from 'react-query'
const { htmlToText } = require('html-to-text')
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
import BounceLoader from "react-spinners/BounceLoader"
import { Redirect } from 'react-router-dom'
import { Dashboard, Recipe } from '..'
import { SortedRecipeInterface, RecipeService, RecipeInput, NewFileInterface, DefaultTile, RecipeInterface } from '../../services/recipe-services'
import AddRecipe from '../Dashboard/Category/AddRecipe/AddRecipe'
import { queryClient } from '../..'
import DOMPurify from 'dompurify'
 
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

 function RecipeLoader() {
    const { mutateAsync } = useMutation('recipes', async(recipeInput: AddRecipeMutationParam) => {
      try {
        return await RecipeService.createRecipe(recipeInput.recipeInput, recipeInput.files, recipeInput.defaultTile)
      } catch(err) {
        console.log(err)
        M.toast({html: 'There was an error.'})
    }}, {
      onSuccess: (newRecipe: {recipeAdded: boolean, recipe: any}) => {
        queryClient.setQueryData('recipes', (currentRecipes: SortedRecipeInterface) => {
          let recipeCategory: string = newRecipe.recipe.category || determineRecipeCategory(newRecipe.recipe.category)
          const recipe = newRecipe.recipe 
          recipe.rawTitle = recipe.raw_title
          const updatedQueryState: SortedRecipeInterface = {
            ...currentRecipes, 
            [recipeCategory]: [...currentRecipes[recipeCategory], newRecipe.recipe]
          }
          // console.log('updatedQueryState = ', updatedQueryState)
          return updatedQueryState
        })

        // console.log('THER AFTERMATH: = ', queryClient.getQueryData('recipes'))
      }
    })

    const { refetch, isLoading, error } = useQuery('recipes', async() => {
      try {
          let recipes: SortedRecipeInterface = await RecipeService.getRecipes()
          return recipes
        } catch (error) {
          return error
        }
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
  
    return (
      <Dashboard 
        fetchRecipes={() => fetchRecipes()} 
        addRecipeMutation={async(recipeInput: AddRecipeMutationParam) => await mutateAsync(recipeInput)}>
      </Dashboard>
    )
  }
 
  export default RecipeLoader;