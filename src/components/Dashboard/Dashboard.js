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

  componentDidMount() {
    let recipes = {
      breakfast: [],
      lunch: [],
      dinner: [],
      side_dishes: [],
      desserts: [],
      desserts: [],
      drinks: [],
      other: []
    }
    // API call to get all recipes
    axios.get(`${process.env.API_URL}/recipes/${this.props.userId}`)
    .then(res => {
      if (res) {
        res.data.forEach((recipe) => {
          if (recipe.category === 'Dinner') {
            recipes.dinner.push(recipe)
          } else if (recipe.category === 'Dessert') {
            recipes.desserts.push(recipe)
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
      console.log(err)
    })
  }


  render() {
    return (
      <>
      <h1 className="Title">Recipe Box<i className="fas fa-utensils"></i></h1>
      <div className="dashboard">
        {this.state.loading_recipes ?
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
            recipes={this.state.recipes.breakfast}
          />
          <Category
            title="Lunch"
            id="lunch"
            recipes={this.state.recipes.lunch}
          />
          <Category
            title="Dinner"
            id="dinner"
            recipes={this.state.recipes.dinner}
          />
          <Category
            title="Side Dishes"
            id="side"
            recipes={this.state.recipes.side_dishes}
          />
          <Category
            title="Desserts"
            id="dessert"
            recipes={this.state.recipes.desserts}
          />
          <Category
            title="Drinks"
            id="drinks"
            recipes={this.state.recipes.drinks}
            />
          <Category
            title="Other"
            id="other"
            recipes={this.state.recipes.other}
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
