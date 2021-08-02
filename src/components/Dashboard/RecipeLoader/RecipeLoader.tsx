
import React from 'react'
import { useQuery } from 'react-query'
import { SortedRecipeInterface, RecipeService } from '../../../services/recipe-services'
import Dashboard from '../Dashboard'

 
 function RecipeLoader() {
    const { isLoading, error, data } = useQuery('fetchRecipes', async() => {
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
  
    if (isLoading) return 'Loading...'
  
    if (error) return 'An error has occurred: ' + error.message
  
    // console.log(data)
    return (
      <Dashboard recipes={data}></Dashboard>
    )
  }
 
  export default RecipeLoader;