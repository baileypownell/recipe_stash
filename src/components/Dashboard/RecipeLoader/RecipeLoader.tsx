
import React from 'react'
import { useQuery, useMutation } from 'react-query'
import { SortedRecipeInterface, RecipeService } from '../../../services/recipe-services'
import Dashboard from '../Dashboard'
import BounceLoader from "react-spinners/BounceLoader"
 
 function RecipeLoader() {
    const { isLoading, error, data } = useQuery('recipes', async() => {
    try {
        console.log('fetching')
        let recipes: SortedRecipeInterface = await RecipeService.getRecipes()
        return recipes
      } catch (error) {
          console.log('Error caught: ', error)
          return error
            // if (error.response?.status === 401) {
            // // unathenticated; redirect to log in 
            // //   this.props.history.push('/login')
            // }
      }
    }, {
        staleTime: Infinity
    })

    // const updateRecipesListMutation = useMutation()
  
    if (isLoading) return <div className="BounceLoader">
      <BounceLoader
        size={100}
        color={"#689943"}
      />
    </div>
  
    if (error) return 'An error has occurred: ' + error.message
  
    return (
      <Dashboard recipes={data}></Dashboard>
    )
  }
 
  export default RecipeLoader;