import axios from 'axios';

export const login = (email) => {
  return {
    type: 'SET_USER_LOGGED_IN',
    email: email
  }
}
