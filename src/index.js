import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
  Home,
  Login,
  Signup,
  Settings,
  ResetPassword,
  Nav
} from './components/index'
import GuardedRoute from './GuardedRoute'

import 'materialize-css/dist/css/materialize.min.css'
import './scss/main.scss'
import RecipeCache from './components/RecipeCache/RecipeCache'
import AuthenticationService from './services/auth-service'
import { createTheme, ThemeProvider } from '@material-ui/core'

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

export const queryClient = new QueryClient()

AuthenticationService.verifyUserSession()
  .then(res => {
    console.log('res.data.authenticated = ', res.data.authenticated)
    if (res.data.authenticated) {
      window.localStorage.setItem('user_logged_in', 'true')
    } else {
      window.localStorage.removeItem('user_logged_in')
    }
  })
  .catch(err => console.log(err))

ReactDOM.render(
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
  </QueryClientProvider>,
  document.getElementById('app')
)
