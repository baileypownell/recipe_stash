import React from 'react'
import ReactDOM from 'react-dom'

import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

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

import 'materialize-css/dist/css/materialize.min.css';
import './scss/main.scss';

import { AuthProvider } from './auth-context'

ReactDOM.render(
  <AuthProvider>
    <BrowserRouter>
      <Nav/>
      <Switch>
        <Route exact={true} path="/" component={Home}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/reset" component={ResetPassword}/>
        <RequireAuthComponent>
          <Route path="/dashboard" exact={true} component={Dashboard}/> 
          <Route path="/settings" component={Settings}/>
          <Route path="/view-recipe/:id" component={Recipe}/>
        </RequireAuthComponent>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
    </AuthProvider>,
  document.getElementById('app')
);
