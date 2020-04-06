import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
//import thunk from "redux-thunk";
//import reducer from './store/reducer';
import Nav from './components/Nav/Nav';
import {
  BrowserRouter,
  Route,
  Link,
  Switch,
  Redirect
} from "react-router-dom";


// for presisting redux store through page refreshes
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage'
// defaults to localStorage for web
//
// import CreateAccount from './components/CreateAccount/CreateAccount';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';

import './scss/main.scss';
const initialState = {
  user: {
    firstName: null,
    lastName: null,
    email: null,
    id: null
  },
  userLoggedIn: false,
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_LOGGED_IN':
      return {
        ...state,
        user: {
          ...state.user,
          email: action.email,
        },
        expiresIn: action.expiresIn,
        idToken: action.idToken,
        localId: action.localId,
        refreshToken: action.refreshToken,
        userLoggedIn: true
      };
    case 'SET_USER_LOGGED_OUT':
      return {
        ...state,
        user: {
          firstName: '',
          lastName: '',
          email: '',
          firebaseAuthID: '',
          weightHistory: []
        },
        expiresIn: '',
        idToken: '',
        localId: '',
        refreshToken: '',
        userLoggedIn: false,
        todaysWeight: '',
        error: ''
    }
    default:
      return state;
  }
};

// const persistConfig = {
//   key: 'root',
//   storage,
// }
// const persistedReducer = persistReducer(persistConfig, reducer)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers());

// let persistor = persistStore(store)

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Nav />
      <Switch>
        <Route exact={true} path="/" component={Home}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/dashboard" component={Dashboard}/>
        <Route path="/settings" component={Settings}/>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
</Provider>,
  document.getElementById('app')
);
