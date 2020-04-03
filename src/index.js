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
// import { persistStore, persistReducer } from 'redux-persist';
// import { PersistGate } from 'redux-persist/integration/react';
// import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
//
// import CreateAccount from './components/CreateAccount/CreateAccount';
 import Home from './components/Home/Home';
 import Login from './components/Login/Login';
 import Signup from './components/Signup/Signup';
// import Program from './components/Program/Program';
// import LogInOrSignUp from './components/LogInOrSignUp/LogInOrSignUp';
//
// import './scss/main.scss';
//
// const persistConfig = {
//   key: 'root',
//   storage,
// }
// const persistedReducer = persistReducer(persistConfig, reducer)
//
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// const store = createStore(persistedReducer, composeEnhancers(
//   applyMiddleware(thunk)
// ));
//
// let persistor = persistStore(store)

ReactDOM.render(
  <BrowserRouter>
    <Nav />
    <Switch>
      <Route exact={true} path="/" component={Home}/>
      <Route path="/login" component={Login}/>
      <Route path="/signup" component={Signup}/>
      <Redirect to="/" />
    </Switch>
  </BrowserRouter>,
  document.getElementById('app')
);
