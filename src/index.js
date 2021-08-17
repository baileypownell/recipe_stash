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
import RecipeLoader from './components/RecipeLoader/RecipeLoader';

export const queryClient = new QueryClient()
ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    {/* <ReactQueryDevtools initialIsOpen={true} /> */}
    <BrowserRouter>
      <Nav/>
      <Switch>
        <Route exact={true} path="/" component={Home}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/reset/:token" component={ResetPassword}/>
        <RequireAuthComponent>
          <Route path="/recipes" exact={true} component={RecipeLoader}/> 
          <Route path="/settings" component={Settings}/>
          <Route path="/recipes/:id" component={Recipe}/>
        </RequireAuthComponent>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
    </QueryClientProvider>,
  document.getElementById('app')
);
