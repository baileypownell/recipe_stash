import { ThemeProvider } from '@mui/material';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home, Login, Nav, ResetPassword, Settings, Signup } from '.';
import AuthenticationService from '../services/auth-service';
import ErrorBoundary from './ErrorBoundary';
import GuardedRoute from './GuardedRoute';
import './index.scss';
import RecipeCache from './RecipeCache';
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

  console.log(AuthenticationService.authenticated());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Nav />
          <ErrorBoundary>
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
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
