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
  RequireAuthComponent
} from './components/index'

import 'materialize-css/dist/css/materialize.min.css';
import './scss/main.scss';

ReactDOM.render(
      <BrowserRouter>
        <Switch>
          <Route exact={true} path="/" component={Home}/>
          <Route path="/login" component={Login}/>
          <Route path="/signup" component={Signup}/>
          <RequireAuthComponent>
            <Route path="/dashboard" exact={true} component={Dashboard}/> 
            <Route path="/settings" component={Settings}/>
            <Route path="/view-recipe/:id" component={Recipe}/>
          </RequireAuthComponent>
          <Route path="/reset" component={ResetPassword}/>
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>,
  document.getElementById('app')
);
