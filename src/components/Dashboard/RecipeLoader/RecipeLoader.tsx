
import React from 'react'
import { useQuery } from 'react-query'
import { SortedRecipeInterface, RecipeService } from '../../../services/recipe-services'
import Dashboard from '../Dashboard'
import BounceLoader from "react-spinners/BounceLoader"
import { Redirect } from 'react-router-dom'
 
 function RecipeLoader() {
    const { isLoading, error, data } = useQuery('recipes', async() => {
    try {
        let recipes: SortedRecipeInterface = await RecipeService.getRecipes()
        return recipes
      } catch (error) {
          console.log(error)
          return error
      }
    }, {
        staleTime: Infinity, 
    })
  
    if (isLoading) return <div className="BounceLoader">
      <BounceLoader
        size={100}
        color={"#689943"}
      />
    </div>
  
    if (error?.response?.status === 401) return <Redirect to="/login"></Redirect>
  
    return (
      <Dashboard recipes={data}></Dashboard>
    )
  }
 
  export default RecipeLoader;