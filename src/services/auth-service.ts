import axios from 'axios';
import { queryClient } from '../components/App';

const AuthenticationService = {
  setUserLoggedIn: (): void => {
    window.localStorage.setItem('user_logged_in', 'true');
  },

  setUserLoggedOut: (): void => {
    window.localStorage.removeItem('user_logged_in');
  },

  authenticated: (): boolean => {
    return !!window.localStorage.getItem('user_logged_in');
  },

  verifyUserSession: async (): Promise<any> => {
    return await axios.get('/auth');
  },

  signInWithGoogle: async (tokenId: string): Promise<any> => {
    return await axios.post('/signin-with-google', {
      token: tokenId,
    });
  },

  signIn: async (password: string, email: string): Promise<any> => {
    return await axios.post('/signin', {
      password,
      email,
    });
  },

  logout: async (): Promise<any> => {
    queryClient.clear();
    return await axios.get('/logout');
  },

  getPasswordResetLink: async (email: string): Promise<any> => {
    return await axios.post('/send-reset-email', { email });
  },

  updatePassword: async (
    password: string,
    token: string,
    email: string,
  ): Promise<any> => {
    const updatePasswordResult = await axios.put('/user/reset-password', {
      password,
      reset_password_token: token,
    });
    const res = await AuthenticationService.signIn(password, email);
    if (res.data.success) {
      AuthenticationService.setUserLoggedIn();
    }

    return updatePasswordResult;
  },

  verifyEmailResetToken: async (token: string): Promise<any> => {
    return await axios.get(`/send-reset-email/${token}`);
  },
};

export default AuthenticationService;
