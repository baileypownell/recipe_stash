import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
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

// for presisting redux store through page refreshes
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';
import reducer from './store/reducer';

const persistConfig = {
  key: 'root',
  storage,
}
const persistedReducer = persistReducer(persistConfig, reducer)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(persistedReducer, composeEnhancers());
let persistor = persistStore(store);

import 'materialize-css/dist/css/materialize.min.css';
import './scss/main.scss';

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Nav />
        <Switch>
          <Route exact={true} path="/" component={Home}/>
          <Route path="/login" component={Login}/>
          <Route path="/signup" component={Signup}/>
          <Route path="/view-recipe/:id" component={Recipe}/>
          <Route path="/dashboard" exact={true} component={Dashboard}/>          
          <Route path="/settings" component={Settings}/>
          <Route path="/reset" component={ResetPassword}/>
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </PersistGate>
</Provider>,
  document.getElementById('app')
);
