import { createTheme, ThemeProvider } from '@material-ui/core'
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { Home, Login, Nav, ResetPassword, Settings, Signup } from '..'
import GuardedRoute from '../../GuardedRoute'
import AuthenticationService from '../../services/auth-service'
import RecipeCache from '../RecipeCache/RecipeCache'

export const queryClient = new QueryClient()

const App = () => {
  useEffect(() => {
    AuthenticationService.verifyUserSession()
      .then(res => res.data.authenticated ? AuthenticationService.setUserLoggedIn() : AuthenticationService.setUserLoggedOut())
      .catch(err => console.log(err))
  }, [])

  const theme = createTheme({
    palette: {
      primary: {
        main: '#e66c6c',
        dark: '#d35151'
      },
      secondary: {
        main: '#87ad6a',
        contrastText: '#fff'
      },
      error: {
        main: '#dd7244',
        dark: '#c23c3c'
      },
      info: {
        main: '#dbdbdb'
      }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Nav />
        <Switch>
        <Route exact={true} path="/" component={Home}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/reset/:token" component={ResetPassword}/>
        <GuardedRoute
            path='/recipes'
            exact={true}
            component={RecipeCache}>
        </GuardedRoute>
        <GuardedRoute
            path='/settings'
            component={Settings}>
        </GuardedRoute>
        <GuardedRoute
            path='/recipes/:id'
            component={RecipeCache}>
        </GuardedRoute>
        <Redirect to="/" />
        </Switch>
      </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
