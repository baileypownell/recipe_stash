import React from 'react';
import ReactDOM from 'react-dom';
const axios = require('axios');

import './Dashboard.scss';

class Home extends React.Component {

  componentDidMount() {
    // API call to get all recipes
    axios.get(`${process.env.API_URL}/recipes/1`)
    .then(res => {
      console.log(res.data)
    })
    .catch((err) => {
      console.log(err)
    })
  }

  render() {
    return (
      <>
      <h1 className="dashboardTitle">Dashboard</h1>
      <div className="dashboard">

        <h2>Your Recipe Box</h2>
        <h3>Breakfast</h3>
          <div className="recipeBox">
            <div className="addRecipe" id="Breakfast">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="recipeCard">
              <h3>French Toast</h3>
            </div>
            <div className="recipeCard">
              <h3>Oatmeal</h3>
            </div>
            <div className="recipeCard">
              <h3>Omelet</h3>
            </div>
          </div>
        <h3>Lunch</h3>
          <div className="recipeBox">
            <div className="addRecipe" id="lunch">
              <i className="fas fa-plus-circle"></i>
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
        <h3>Dinner</h3>
        <div className="recipeBox">
          <div className="addRecipe">
            <i className="fas fa-plus-circle"></i>
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
        <h3>Side Dishes</h3>
          <div className="recipeBox">
            <div className="addRecipe" id="side">
              <i className="fas fa-plus-circle"></i>
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
        <h3>Desserts</h3>
          <div className="recipeBox">
            <div className="addRecipe" id="dessert">
              <i className="fas fa-plus-circle"></i>
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
        <h3>Drinks</h3>
          <div className="recipeBox">
            <div className="addRecipe" id="drinks">
              <i className="fas fa-plus-circle"></i>
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
        <h3>Other</h3>
          <div className="recipeBox">
            <div className="addRecipe" id="other">
              <i className="fas fa-plus-circle"></i>
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
     </>
    )
  }
}

export default Home;
