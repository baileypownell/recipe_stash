export const login = () => {
  return {
    type: 'SET_USER_LOGGED_IN', 
    loggedIn: true
  }
}

export const logout = () => {
  return {
    type: 'SET_USER_LOGGED_OUT',
    loggedIn: false
  }
}

