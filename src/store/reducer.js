
const initialState = {
  loggedIn: false
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_LOGGED_IN':
      return {
        loggedIn: true
      };
    case 'SET_USER_LOGGED_OUT':
      return {
        loggedIn: false
    }
    default:
      return state;
  }
};

export default reducer;
