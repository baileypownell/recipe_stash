
const initialState = {
  user: {
    firstName: null,
    lastName: null,
    email: null,
    id: null
  },
  userLoggedIn: false
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_LOGGED_IN':
      return {
        ...state,
        user: {
          ...state.user,
          email: action.email,
          firstName: action.firstName,
          lastName: action.lastName,
          id: action.id
        },
        userLoggedIn: true
      };
    case 'SET_USER_LOGGED_OUT':
      return {
        ...state,
        user: {
          ...state.user,
          email: null,
          firstName: null,
          lastName: null,
          id: null
        },
        userLoggedIn: false,
        recipe: null
    }
    case 'UPDATE_EMAIL':
    return {
      ...state,
      user: {
        ...state.user,
        email: action.email
      }
    }
    case 'UPDATE_NAME':
    return {
      ...state,
      user: {
        ...state.user,
        firstName: action.firstName,
        lastName: action.lastName
      }
    }
    default:
      return state;
  }
};

export default reducer;
