import { createTheme, ThemeProvider } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home, Login, Nav, ResetPassword, Settings, Signup } from '..';
import GuardedRoute from '../../GuardedRoute';
import AuthenticationService from '../../services/auth-service';
import RecipeCache from '../RecipeCache/RecipeCache';

export const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    AuthenticationService.verifyUserSession()
      .then((res) =>
        res.data.authenticated
          ? AuthenticationService.setUserLoggedIn()
          : AuthenticationService.setUserLoggedOut(),
      )
      .catch((err) => console.log(err));
  }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#e66c6c',
        dark: '#d35151',
      },
      secondary: {
        main: '#87ad6a',
        contrastText: '#fff',
      },
      error: {
        main: '#dd7244',
        dark: '#c23c3c',
      },
      info: {
        main: '#f7f7f7',
        contrastText: '#353531',
      },
      gray: {
        main: '#353531',
      },
    },
  });

  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_LOGIN_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Nav />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset/:token" element={<ResetPassword />} />
              <Route
                path="/recipes"
                element={
                  <GuardedRoute>
                    <RecipeCache />
                  </GuardedRoute>
                }
              >
                <Route
                  path=":id"
                  element={
                    <GuardedRoute>
                      <RecipeCache />
                    </GuardedRoute>
                  }
                ></Route>
              </Route>
              <Route
                path="/settings"
                element={
                  <GuardedRoute>
                    <Settings />
                  </GuardedRoute>
                }
              ></Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
