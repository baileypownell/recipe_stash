import React from 'react';
const axios = require('axios');
import BounceLoader from "react-spinners/BounceLoader";
import { connect } from 'react-redux';
import Category from './Category/Category';

import './Dashboard.scss';

class Dashboard extends React.Component {

  state = {
    unfilteredRecipes: null,
    loading_recipes: true,
    filteredRecipes: null,
    results: [],
    value: '',
  }

  fetchRecipes = () => {
    axios.get(`/recipes`)
    .then(res => {
        if (res.data.name === "error") {
        this.setState({
          loading_recipes: false
        })
        return;
      }
      res.data.breakfast.sort(this.sortByTitle)
      res.data.lunch.sort(this.sortByTitle)
      res.data.dinner.sort(this.sortByTitle)
      res.data.side_dish.sort(this.sortByTitle)
      res.data.dessert.sort(this.sortByTitle)
      res.data.drinks.sort(this.sortByTitle)
      res.data.other.sort(this.sortByTitle)
      this.setState({
        unfilteredRecipes: res.data,
        filteredRecipes: res.data,
        loading_recipes: false
      })
    })
    .catch((err) => {
      console.log(err);
      this.setState({
        loading_recipes: false
      })
    })    
  }

  sortByTitle(a, b) {
    if (a.title > b.title) {
      return 1
    } else if (a.title < b.title ) {
      return -1
    }
    return 0 
  }

  componentDidMount() {
    !this.props.loggedIn ? this.props.history.push('/home') : null
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

  handleSearchChange = (e) => {
    let input = e.target.value.toLowerCase().trim()
    let recipesNarrowedByInput = {
      breakfast: [], 
      lunch: [], 
      dinner: [],
      other: [], 
      dessert: [], 
      other: [], 
      side_dish: []
    }

    if (input.length > 0) {
      recipesNarrowedByInput.breakfast = this.state.unfilteredRecipes.breakfast.filter(recipe => {
        return recipe.title.toLowerCase().includes(input)
      })
      recipesNarrowedByInput.lunch = this.state.unfilteredRecipes.lunch.filter(recipe => {
        return recipe.title.toLowerCase().includes(input)
      })
      recipesNarrowedByInput.dinner = this.state.unfilteredRecipes.dinner.filter(recipe => {
        return recipe.title.toLowerCase().includes(input)
      })
      recipesNarrowedByInput.dessert = this.state.unfilteredRecipes.dessert.filter(recipe => {
        return recipe.title.toLowerCase().includes(input)
      })
      recipesNarrowedByInput.other = this.state.unfilteredRecipes.other.filter(recipe => {
        return recipe.title.toLowerCase().includes(input)
      })
      recipesNarrowedByInput.side_dish = this.state.unfilteredRecipes.side_dish.filter(recipe => {
        return recipe.title.toLowerCase().includes(input)
      })
      recipesNarrowedByInput.drinks = this.state.unfilteredRecipes.drinks.filter(recipe => {
        return recipe.title.toLowerCase().includes(input)
      })
    } else {
      recipesNarrowedByInput = this.state.unfilteredRecipes
    }

    this.setState({
      filteredRecipes: recipesNarrowedByInput
    })
  }

  render() {

    const { filteredRecipes, loading_recipes } = this.state;

    return (
      <>
      <div className="title">
        <div>
          <h1>Recipe Box</h1>
          <div className="searchbar">
          <input onChange={this.handleSearchChange} type="text" placeholder="Find a recipe"></input><i className="fas fa-search"></i>
        </div>
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
            recipes={filteredRecipes.breakfast}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Lunch"
            id="lunch"
            recipes={filteredRecipes.lunch}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dinner"
            id="dinner"
            recipes={filteredRecipes.dinner}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Side Dish"
            id="side"
            recipes={filteredRecipes.side_dish}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dessert"
            id="dessert"
            recipes={filteredRecipes.dessert}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Drinks"
            id="drinks"
            recipes={filteredRecipes.drinks}
            updateDashboard={this.updateDashboard}
            />
          <Category
            title="Other"
            id="other"
            recipes={filteredRecipes.other}
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
    loggedIn: state.loggedIn
  }
}

export default connect(mapStateToProps)(Dashboard);
