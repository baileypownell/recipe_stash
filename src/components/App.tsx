import { ThemeProvider } from '@mui/material';
import { createContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthenticationService from '../services/auth-service';
import ErrorBoundary from './ErrorBoundary';
import GuardedRoute from './GuardedRoute';
import './index.scss';
import RecipeCache from './RecipeCache';
import { theme } from './theme';
import Nav from './Nav';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import ResetPassword from './ResetPassword';
import Settings from './Settings';
import { SortedRecipeInterface } from '../services/recipe-services';

export const queryClient = new QueryClient();
export const RecipeContext = createContext<SortedRecipeInterface | null>(null);

const App = () => {
  const [authStateVerified, setAuthStateVerified] = useState(false);
  useEffect(() => {
    AuthenticationService.verifyUserSession()
      .then((res) => {
        res.data.authenticated
          ? AuthenticationService.setUserLoggedIn()
          : AuthenticationService.setUserLoggedOut();
      })
      .catch((err) => console.log(err))
      .finally(() => setAuthStateVerified(true));
  }, []);

  if (!authStateVerified) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <RecipeContext.Provider value={null}>
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
        </RecipeContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
