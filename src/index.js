import React from 'react'
import ReactDOM from 'react-dom'
import { ReactQueryDevtools } from 'react-query/devtools'
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import {
  Home,
  Login,
  Signup,
  Dashboard,
  Recipe,
  Settings,
  ResetPassword,
  RequireAuthComponent,
  Nav
} from './components/index'

import 'materialize-css/dist/css/materialize.min.css'
import './scss/main.scss'
import RecipeCache from './components/RecipeCache/RecipeCache'
import { createTheme, ThemeProvider } from '@material-ui/core'

const theme = createTheme({
  palette: {
    primary: {
      main: '#e66c6c',
      dark: '#d35151'
    },
    secondary: {
      main: '#dd7244',
      dark: '#c23c3c'
    },
    info: {
      main: '#dbdbdb'
    }
  }
})

export const queryClient = new QueryClient()
ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Nav/>
        <Switch>
          <Route exact={true} path="/" component={Home}/>
          <Route path="/login" component={Login}/>
          <Route path="/signup" component={Signup}/>
          <Route path="/reset/:token" component={ResetPassword}/>
          <RequireAuthComponent>
            <Route 
              path="/recipes" 
              exact={true}
              render={(props) => (
                <RecipeCache dashboard={true}></RecipeCache>
              )} /> 
            <Route path="/settings" component={Settings}/>
            <Route 
              path="/recipes/:id" 
              render={(props) => (
                <RecipeCache individualRecipe={true}></RecipeCache>
              )}
              />
          </RequireAuthComponent>
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>,
  document.getElementById('app')
)