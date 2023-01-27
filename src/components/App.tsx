import { ThemeProvider } from '@mui/material';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home, Login, Nav, ResetPassword, Settings, Signup } from '.';
import GuardedRoute from './GuardedRoute';
import AuthenticationService from '../services/auth-service';
import RecipeCache from './RecipeCache';
import './index.scss';
import { theme } from './theme';

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

  return (
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
  );
};

export default App;
