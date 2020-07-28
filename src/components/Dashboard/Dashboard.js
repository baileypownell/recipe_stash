import React from 'react';
import { connect } from 'react-redux';
const axios = require('axios');
import BounceLoader from "react-spinners/BounceLoader";
import { Search } from 'semantic-ui-react';

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
    let recipes = [
       []
      ,
       []
      ,
       []
      ,
      []
      ,
      
      []
      ,
      []
      ,
      [],
      []
      ,
    ]
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
        console.log(recipes[0].breakfast)
        res.data.forEach((recipe) => {
          if (recipe.category === 'Dinner') {
            recipes[2].push(recipe)
          } else if (recipe.category === 'Dessert') {
            recipes[4].push(recipe)
          } else if (recipe.category === 'Drinks') {
            recipes[6].push(recipe)
          } else if (recipe.category === 'Lunch') {
            recipes[1].push(recipe)
          } else if (recipe.category === 'Breakfast') {
            recipes[0].push(recipe)
          } else if (recipe.category === 'Other') {
            recipes[7].push(recipe)
          } else if (recipe.category === 'Side Dish') {
            recipes[3].push(recipe)
          }
        });
        this.setState({
          unfilteredRecipes: recipes,
          filteredRecipes: recipes,
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

  handleSearchChange = (e) => {
    let input = e.target.value.toLowerCase().trim()
    let recipesNarrowedByInput = this.state.unfilteredRecipes
    recipesNarrowedByInput = recipesNarrowedByInput.map((el) => {
      return el.filter(recipe => recipe.title.toLowerCase().includes(input))
    })
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
          <h1 >Recipe Box</h1>
        </div>
        <div className="searchbar">
          <input onChange={this.handleSearchChange} type="text" placeholder="Find a recipe"></input><i class="fas fa-search"></i>
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
            recipes={filteredRecipes ? filteredRecipes[0] : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Lunch"
            id="lunch"
            recipes={filteredRecipes ? filteredRecipes[1] : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dinner"
            id="dinner"
            recipes={filteredRecipes ? filteredRecipes[2] : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Side Dish"
            id="side"
            recipes={filteredRecipes ? filteredRecipes[3] : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Dessert"
            id="dessert"
            recipes={filteredRecipes ? filteredRecipes[4] : []}
            updateDashboard={this.updateDashboard}
          />
          <Category
            title="Drinks"
            id="drinks"
            recipes={filteredRecipes ? filteredRecipes[5] : []}
            updateDashboard={this.updateDashboard}
            />
          <Category
            title="Other"
            id="other"
            recipes={filteredRecipes ? filteredRecipes[6] : []}
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
