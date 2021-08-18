
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

export interface AddRecipeMutationParam {
  recipeInput: RecipeInput, 
  files: NewFileInterface[], 
  defaultTile: DefaultTile | null
}
import BounceLoader from "react-spinners/BounceLoader"
import { Redirect } from 'react-router-dom'
import { Dashboard } from '..'
import { SortedRecipeInterface, RecipeService, RecipeInput, NewFileInterface, DefaultTile } from '../../services/recipe-services'
import { queryClient } from '../..'

 
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

 function RecipeCache() {
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
          const recipe: RecipeInput = {
            title: newRecipe.recipe.title, 
            rawTitle: newRecipe.recipe.raw_title, 
            category: newRecipe.recipe.category, 
            ingredients: newRecipe.recipe.ingredients, 
            directions: newRecipe.recipe.directions, 
            isNoBake: newRecipe.recipe.no_bake, 
            isEasy: newRecipe.recipe.easy, 
            isHealthy: newRecipe.recipe.healthy, 
            isGlutenFree: newRecipe.recipe.gluten_free, 
            isDairyFree: newRecipe.recipe.dairy_free, 
            isSugarFree: newRecipe.recipe.sugar_free, 
            isVegetarian: newRecipe.recipe.vegetarian, 
            isVegan: newRecipe.recipe.vegan, 
            isKeto: newRecipe.recipe.keto
          }
          const updatedQueryState = {
            ...currentRecipes, 
            [recipeCategory]: [...currentRecipes[recipeCategory], recipe].sort(RecipeService.sortByTitle)
          }
          return updatedQueryState
        })
      }
    })

    const { refetch, isLoading, error, data } = useQuery('recipes', async() => {
      try {
          let recipes: SortedRecipeInterface = await RecipeService.getRecipes()
          console.log('just got ', recipes)
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
  
    return (
      <Dashboard 
        recipes={data}
        fetchRecipes={() => fetchRecipes()} 
        addRecipeMutation={async(recipeInput: AddRecipeMutationParam) => await mutateAsync(recipeInput)}>
      </Dashboard>
    )
  }
 
  export default RecipeCache;