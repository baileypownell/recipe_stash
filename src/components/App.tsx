import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Box, MantineProvider, useMantineTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthenticationService from '../services/auth-service';
import ErrorBoundary from './ErrorBoundary';
import GuardedRoute from './GuardedRoute';
import RecipeCache from './RecipeCache';
import { mantineTheme } from './theme';
import Nav from './Nav';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import ResetPassword from './ResetPassword';
import Settings from './Settings';

export const queryClient = new QueryClient();

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
      <MantineProvider theme={mantineTheme}>
          <Notifications position="top-right" />
          <style>{`
            * {
              box-sizing: border-box;
            }

            html,
            body,
            #app {
              height: 100%;
            }

            body {
              margin: 0;
              overflow-x: hidden;
            }

            #app {
              display: grid;
              grid-template-columns: 1fr;
              grid-template-rows: auto 1fr;
              grid-template-areas:
                'header'
                'main';
            }

            main {
              grid-area: main;
              min-height: 0;
              display: flex;
              flex-direction: column;
            }

            main > * {
              flex: 1;
            }
          `}</style>
          <BrowserRouter>
            <Nav />
            <Box component="main">
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
            </Box>
          </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;
