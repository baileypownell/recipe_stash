import React from 'react';
import ReactDOM from 'react-dom';
import Nav from './components/Nav/Nav';

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
  ResetPassword
} from './components/index';

import 'materialize-css/dist/css/materialize.min.css';
import './scss/main.scss';

ReactDOM.render(
      <BrowserRouter>
        <Nav />
        <Switch>
          <Route exact={true} path="/" component={Home}/>
          <Route path="/login" component={Login}/>
          <Route path="/signup" component={Signup}/>
          <Route path="/dashboard" exact={true} component={Dashboard}/>
          <Route path="/dashboard/:id" component={Recipe}/>
          <Route path="/settings" component={Settings}/>
          <Route path="/reset" component={ResetPassword}/>
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>,
  document.getElementById('app')
);
