import React from 'react';
import ReactDOM from 'react-dom';
import icon from '../../images/apple-touch-icon.png';
import whisk from '../../images/cooking.svg';
// imports for connecting this component to Redux state store
//import { connect } from 'react-redux';
//import * as actionTypes from '../../store/actionTypes';

import './Home.scss';

class Home extends React.Component {

  state = {
    message: 'All of your recipes.',
    messageNum: 0
  }

  // componentDidMount() {
  //   let messages = [
  //     'All of your recipes.',
  //     'All in one place',
  //     'And it\'s free'
  //   ];
  //   setInterval(() => {
  //     this.setState(prevState => ({
  //       messageNum: prevState.messageNum+1,
  //       message: messages[prevState.messageNum+1]
  //     }))
  //   }, 3000)
  // }

  render() {
    return (
      <div id="home">
        <div id="picture">
          <div className="flex">
            <img src={icon} alt="logo" /><h1>Virtual Cookbook</h1>
          </div>
          <div className="blurbs">
            <h2>All of your recipes.</h2>
            <h2>All in one place.</h2>
            <h2>And it's free.</h2>
          </div>

          </div>
          <div id="skew">
            <img id="whisk" src={whisk} alt="whisk" />
            <h2>Create an acount and start saving your recipes</h2>
            <h1>FOREVER</h1>
            <div id="button_parent">
              <button className="button">Start Cooking</button>
            </div>
          </div>
     </div>
    )
  }
}

export default Home;
