import axios from 'axios';

export const login = (id, firstName, lastName, email) => {
  return {
    type: 'SET_USER_LOGGED_IN',
    email: email,
    id: id,
    firstName: firstName,
    lastName: lastName
  }
}

export const logout = () => {
  return {
    type: 'SET_USER_LOGGED_OUT',
    email: null,
    id: null,
    firstName: null,
    lastName: null
  }
}

export const setRecipe = (recipe) => {
  return {
    type: 'SET_RECIPE',
    recipe: recipe
  }
}
