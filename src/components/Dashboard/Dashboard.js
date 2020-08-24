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
    let recipesNarrowedByInput = this.state.unfilteredRecipes
    console.log(recipesNarrowedByInput)
    // recipesNarrowedByInput = Object.values(recipesNarrowedByInput).forEach(category => {
    //   console.log(category)
    //   return category.map(el => el.filter(recipe => recipe.title.toLowerCase().includes(input)))
    // })
    console.log(input)
    recipesNarrowedByInput.breakfast.filter(recipe => {
      console.log(recipe.title.toLowerCase().includes(input))
      return recipe.title.toLowerCase().includes(input)
    })
    console.log(recipesNarrowedByInput.breakfast)
  
    // recipesNarrowedByInput = recipesNarrowedByInput.map((el) => {
    //   return el.filter(recipe => recipe.title.toLowerCase().includes(input))
    // })
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
            recipes={filteredRecipes ? filteredRecipes.breakfast : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Lunch"
            id="lunch"
            recipes={filteredRecipes ? filteredRecipes.lunch : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dinner"
            id="dinner"
            recipes={filteredRecipes ? filteredRecipes.dinner : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Side Dish"
            id="side"
            recipes={filteredRecipes ? filteredRecipes.side_dish : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dessert"
            id="dessert"
            recipes={filteredRecipes ? filteredRecipes.dessert : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Drinks"
            id="drinks"
            recipes={filteredRecipes ? filteredRecipes.drinks : []}
            updateDashboard={this.updateDashboard}
            />
          <Category
            title="Other"
            id="other"
            recipes={filteredRecipes ? filteredRecipes.other : []}
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
