import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
const axios = require('axios');
import BounceLoader from "react-spinners/BounceLoader";

import Category from './Category/Category';

import './Dashboard.scss';

class Dashboard extends React.Component {

  state = {
    recipes: null,
    loading_recipes: true
  }

  fetchRecipes = () => {
    let recipes = {
      breakfast: [],
      lunch: [],
      dinner: [],
      side_dishes: [],
      desserts: [],
      dessert: [],
      drinks: [],
      other: []
    }
    // API call to get all recipes
    axios.get(`/recipes/${this.props.userId}`)
    .then(res => {
      if (res) {
        if (res.data.name === "error") {
          this.setState({
            loading_recipes: false
          })
          return;
        }
        res.data.forEach((recipe) => {
          if (recipe.category === 'Dinner') {
            recipes.dinner.push(recipe)
          } else if (recipe.category === 'Dessert') {
            recipes.dessert.push(recipe)
          } else if (recipe.category === 'Drinks') {
            recipes.drinks.push(recipe)
          } else if (recipe.category === 'Lunch') {
            recipes.lunch.push(recipe)
          } else if (recipe.category === 'Breakfast') {
            recipes.breakfast.push(recipe)
          } else if (recipe.category === 'Other') {
            recipes.other.push(recipe)
          } else if (recipe.category === 'Side Dish') {
            recipes.side_dishes.push(recipe)
          }
        });
        this.setState({
          recipes: recipes,
          loading_recipes: false
        })
      }
    })
    .catch((err) => {
      console.log(err);
      this.setState({
        loading_recipes: false
      })
    })
  }

  componentDidMount() {
    this.fetchRecipes();
    let faded = document.querySelectorAll('.fade');
    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
      faded[i].classList.add('fade-in');
      }
    }
    setTimeout(Appear, 300);
  }

  updateDashboard = () => {
    this.fetchRecipes();
  }

  render() {

    const { recipes, loading_recipes } = this.state;

    return (
      <>
      <div className="searchbar">
        <div>
          <h1 >Recipe Box<i className="fas fa-utensils"></i></h1>
        </div>
        <div>
          <input type="text"></input><i class="fas fa-search"></i>
        </div>
      </div>
      
      <div className="dashboard">
        {loading_recipes ?
          <div className="BounceLoader">
            <BounceLoader
              size={100}
              color={"#689943"}
            />
          </div>
          :
          <>
          <Category
            title="Breakfast"
            id="breakfast"
            recipes={recipes ? recipes.breakfast : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Lunch"
            id="lunch"
            recipes={recipes ? recipes.lunch : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dinner"
            id="dinner"
            recipes={recipes ? recipes.dinner : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Side Dish"
            id="side"
            recipes={recipes ? recipes.side_dishes : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dessert"
            id="dessert"
            recipes={recipes ? recipes.dessert : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Drinks"
            id="drinks"
            recipes={recipes ? recipes.drinks : []}
            updateDashboard={this.updateDashboard}
            />
          <Category
            title="Other"
            id="other"
            recipes={recipes ? recipes.other : []}
            updateDashboard={this.updateDashboard}
            />
            </>
        }
     </div>
     </>
    )
  }
}


const mapStateToProps = state => {
  return {
    userId: state.user.id
  }
}

export default connect(mapStateToProps)(Dashboard);
