import React from 'react';
import ReactDOM from 'react-dom';
import icon from '../../images/apple-touch-icon.png'
// imports for connecting this component to Redux state store
//import { connect } from 'react-redux';
//import * as actionTypes from '../../store/actionTypes';

import './Home.scss';

class Home extends React.Component {
  render() {
    return (
      <div id="home">
        <div className="flex">
          <img src={icon} alt="logo" /><h1>Virtual Cookbook</h1>
        </div>
        <div className="blurbs">
          <h2>All of your recipes.</h2>
          <h2>All in one place.</h2>
          <h2>And it's free.</h2>
        </div>
        <button className="button">Start Cooking</button>
     </div>
    )
  }
}

export default Home;
