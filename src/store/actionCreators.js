export const login = (id, email, firstName, lastName) => {
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

export const updateEmail = (email) => {
  return {
    type: 'UPDATE_EMAIL',
    email: email
  }
}

export const updateName = (firstName, lastName) => {
  return {
    type: 'UPDATE_NAME',
    firstName: firstName,
    lastName: lastName
  }
}
