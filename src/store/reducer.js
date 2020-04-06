const initialState = {
  user: {
    firstName: null,
    lastName: null,
    email: null,
    id: null
  },
  userLoggedIn: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER_LOGGED_IN:
      return {
        ...state,
        user: {
          ...state.user,
          email: action.email,
        },
        expiresIn: action.expiresIn,
        idToken: action.idToken,
        localId: action.localId,
        refreshToken: action.refreshToken,
        userLoggedIn: true
      };
    case actionTypes.SET_USER_LOGGED_OUT:
      return {
        ...state,
        user: {
          firstName: '',
          lastName: '',
          email: '',
          firebaseAuthID: '',
          weightHistory: []
        },
        expiresIn: '',
        idToken: '',
        localId: '',
        refreshToken: '',
        userLoggedIn: false,
        todaysWeight: '',
        error: ''
    }
    case actionTypes.DELETE_USER:
      return {
        ...state,
        user: {
          firstName: '',
          lastName: '',
          email: '',
          firebaseAuthID: '',
          weightHistory: []
        },
        expiresIn: '',
        idToken: '',
        localId: '',
        refreshToken: '',
        userLoggedIn: false,
        todaysWeight: '',
        error: ''
    }
    case actionTypes.SET_USER_DATA:
      return {
        ...state,
        user: {
          ...state.user,
          firstName: action.firstName,
          lastName: action.lastName,
        },
        todaysWeight: action.todaysWeight
      };
    case actionTypes.SET_TODAYS_WEIGHT:
      return {
        ...state,
        user: {
          ...state.user
        },
        todaysWeight: action.todaysWeight
      };
    case actionTypes.EDIT_TODAYS_WEIGHT:
      return {
        ...state,
        user: {
          ...state.user,
          weightHistory: action.updatedWeights
        },
        todaysWeight: action.todaysWeight
      };
  case actionTypes.CREATE_ACCOUNT:
      return {
        ...state,
        user: {
          ...state.user,
          email: action.email,
          firstName: action.firstName,
          lastName: action.lastName,
          firebaseAuthID: action.firebaseAuthID,
        },
        userLoggedIn: true,
        expiresIn: action.expiresIn,
        idToken: action.idToken,
        localId: action.localId,
        refreshToken: action.refreshToken
      };
    case actionTypes.CHANGE_FIRST_NAME:
      return {
        ...state,
        user: {
          ...state.user,
          firstName: action.firstName
        }
      }
      case actionTypes.CHANGE_LAST_NAME:
        return {
          ...state,
          user: {
            ...state.user,
            lastName: action.lastName
          }
        }
    case actionTypes.CHANGE_PASSWORD:
      return {
        ...state,
        user: {
          ...state.user
        }
      }
    case actionTypes.CHANGE_EMAIL:
      return {
        ...state,
        user: {
          ...state.user,
          email: action.newEmail
        },
        idToken: action.idToken
      }
    case actionTypes.SET_WEIGHT_HISTORY:
      return {
        ...state,
        user: {
          ...state.user,
          weightHistory: action.weightHistory
        }
      }
    default:
      return state;
  }
};

export default reducer;
