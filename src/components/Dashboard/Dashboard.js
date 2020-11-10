import React from 'react';
const axios = require('axios');
import BounceLoader from "react-spinners/BounceLoader";
import { connect } from 'react-redux';
import Category from './Category/Category';

import './Dashboard.scss';

class Dashboard extends React.Component {

  state = {
    unfilteredRecipes: null,
    recipes_loaded: false,
    filteredRecipes: null,
    results: [],
    value: '',
    filter: {
      dairyFree: false, 
      easy: false, 
      glutenFree: false, 
      healthy: false, 
      keto: false, 
      noBake: false, 
      sugarFree: false, 
      vegan: false, 
      vegetarian: false, 
    }
  }

  fetchRecipes = () => {
    axios.get(`/recipes`)
    .then(res => {
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
        recipes_loaded: true
      })
    })
    .catch((err) => {
      console.log(err);
      this.setState({
        recipes_loaded: false
      })
      this.props.history.push('/login')
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


    // filter dropdown
    const dropdown = document.querySelector('.dropdown-trigger');
    M.Dropdown.init(dropdown, {
      onCloseStart: (e) => {
        e.stopPropagation()
      }
    });

  }

  filter = (e) => {
    let currentState = this.state.filter[e.target.id]
    let filter = {
      ...this.state.filter,
      [e.target.id]: !currentState,
    }
    this.setState({
      ...this.state, 
      filter: filter
    })
  }

  componentWillUpdate(a, newState, b) {
    console.log(newState)
    // filter recipes based on tags 
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

    const { filteredRecipes, recipes_loaded } = this.state;

    return (
      <>
      <div className="title">
        <div>
          <h1>Recipe Box</h1>
          <div className="searchbar">
          <input onChange={this.handleSearchChange} type="text" placeholder="Find a recipe"></input><i className="fas fa-search"></i>

          <button className='dropdown-trigger btn' href='#' data-target='dropdown1' id="filter-button"><span>Filter</span><i className="small material-icons">filter_list</i> </button>

          <ul id='dropdown1' className='dropdown-content'>
            <li >
              <label>
                <input  id="dairyFree" onClick={this.filter} type="checkbox" />
                <span>Dairy-Free</span>
              </label>
            </li>
            <li>
              <label>
                <input id="easy" onClick={this.filter}  type="checkbox"  />
                <span>Easy</span>
              </label>
            </li>
            <li>
              <label>
                <input id="glutenFree" onClick={this.filter}  type="checkbox"  />
                <span>Gluten-Free</span>
              </label>
            </li>
            <li>
              <label>
                <input id="healthy" onClick={this.filter}  type="checkbox"  />
                <span>Healthy</span>
              </label>
            </li>
            <li>
              <label>
                <input id="keto" onClick={this.filter}  type="checkbox"  />
                <span>Keto</span>
              </label>
            </li>
            <li>
              <label>
                <input id="noBake" onClick={this.filter}  type="checkbox"  />
                <span>No Bake</span>
              </label>
            </li>
            <li>
              <label>
                <input id="sugarFree" onClick={this.filter}  type="checkbox"  />
                <span>Sugar-Free</span>
              </label>
            </li>
            <li>
              <label>
                <input id="vegan" onClick={this.filter}  type="checkbox"  />
                <span>Vegan</span>
              </label>
            </li>
            <li>
              <label>
                <input id="vegetarian" onClick={this.filter}  type="checkbox"  />
                <span>Vegetarian</span>
              </label>
            </li>
            {/* <li class="divider" tabindex="-1"></li>
            <li><a href="#!">three</a></li>
            <li><a href="#!"><i class="material-icons">view_module</i>four</a></li>
            <li><a href="#!"><i class="material-icons">cloud</i>five</a></li> */}
          </ul>
        </div>
        </div>
      </div>
      
      <div className="dashboard">
        {!recipes_loaded ?
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
