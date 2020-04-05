import React from 'react';
import ReactDOM from 'react-dom';
const axios = require('axios');

import './Dashboard.scss';

class Home extends React.Component {

  render() {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <h2>Your Recipe Box</h2>
        <div className="recipeBox">
          <div id="addRecipe">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div className="recipeCard">
            <h3>Spaghetti</h3>
          </div>
          <div className="recipeCard">
            <h3>Lasagna</h3>
          </div>
          <div className="recipeCard">
            <h3>Zuppa Toscana</h3>
          </div>
          <div className="recipeCard">
            <h3>Potato Soup</h3>
          </div>
        </div>

     </div>
    )
  }
}

export default Home;
