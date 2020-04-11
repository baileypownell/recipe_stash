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

// for presisting redux store through page refreshes
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';
import reducer from './store/reducer';

import {
  Home,
  Login,
  Signup,
  Dashboard,
  Recipe,
  Settings
} from './components/index';

import './scss/main.scss';

const persistConfig = {
  key: 'root',
  storage,
}
const persistedReducer = persistReducer(persistConfig, reducer)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(persistedReducer, composeEnhancers());
let persistor = persistStore(store);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Nav />
        <Switch>
          <Route exact={true} path="/" component={Home}/>
          <Route path="/login" component={Login}/>
          <Route path="/signup" component={Signup}/>
          <Route path="/dashboard" exact={true} component={Dashboard}/>
          <Route path="/dashboard/:id" component={Recipe}/>
          <Route path="/settings" component={Settings}/>
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </PersistGate>
</Provider>,
  document.getElementById('app')
);
