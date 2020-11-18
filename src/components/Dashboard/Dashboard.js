import React from 'react';
const axios = require('axios');
import BounceLoader from "react-spinners/BounceLoader";
import { connect } from 'react-redux';
import Category from './Category/Category';
import { of, subscribe, merge, pipe, BehaviorSubject, Observable, combineLatest } from "rxjs";
import {skip} from "rxjs/operators";
import './Dashboard.scss';

let userInputSubject = new BehaviorSubject('')
let userInput$ = userInputSubject.asObservable()

const appliedFiltersSubject = new BehaviorSubject(null)
let appliedFilters$ = appliedFiltersSubject.asObservable()


class Dashboard extends React.Component {

  state = {
    unfilteredRecipes: null,
    recipes_loaded: false,
    filteredRecipes: null,
    filter: {
      dairy_free: false, 
      easy: false, 
      gluten_free: false, 
      healthy: false, 
      keto: false, 
      no_bake: false, 
      sugar_free: false, 
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
      closeOnClick: false,
    })

    // combineLatest([
    //   appliedFilters$,
    //   userInput$
    // ]).subscribe(([filters, input]) => {
    //   console.log(filters, input)
    //   let newFilteredRecipesState = {
    //     ...this.state.unfilteredRecipes
    //   }
    //   for (const category in this.state.unfilteredRecipes) {
    //     let filteredCategory = this.state.unfilteredRecipes[category].filter(recipe => recipe.title.toLowerCase().includes(input))
    //     newFilteredRecipesState[category] = filteredCategory
    //   }

    //   let selectedTags = []
    //   for (const tag in filters) {
    //     if (filters[tag]) {
    //       selectedTags.push(tag)
    //     }
    //   }
    //   if (selectedTags.length) {
    //     // limit to only those recipes whose tags include each checked result from res (true) 
    //     for (const category in newFilteredRecipesState) {
    //       let filteredCategory = newFilteredRecipesState[category]
    //       .filter(recipe => recipe.tags.length >= 1)
    //       .filter(recipe => selectedTags.every(tag => recipe.tags.includes(tag)))
    //       newFilteredRecipesState[category] = filteredCategory
    //     }

    //     this.setState({
    //       filteredRecipes: newFilteredRecipesState
    //     })
    //   } else {
    //     this.setState({
    //       filteredRecipes: newFilteredRecipesState
    //     })
    //   }
    // })
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
    }, () => {
      appliedFiltersSubject.next(this.state.filter)
      this.applyBothFilters()
     })
  }

  updateDashboard = () => {
    this.fetchRecipes();
  }


  applyBothFilters = () => {
    let filters = appliedFiltersSubject.getValue()
    let input = userInputSubject.getValue()
      console.log(filters, input, 'right here')
      let newFilteredRecipesState = {
        ...this.state.unfilteredRecipes
      }
      for (const category in this.state.unfilteredRecipes) {
        let filteredCategory = this.state.unfilteredRecipes[category].filter(recipe => recipe.title.toLowerCase().includes(input))
        newFilteredRecipesState[category] = filteredCategory
      }

      let selectedTags = []
      for (const tag in filters) {
        if (filters[tag]) {
          selectedTags.push(tag)
        }
      }
      console.log('selectedTags = ', selectedTags)
      if (selectedTags.length) {
        // limit to only those recipes whose tags include each checked result from res (true) 
        for (const category in newFilteredRecipesState) {
          let filteredCategory = newFilteredRecipesState[category]
          .filter(recipe => recipe.tags.length >= 1)
          .filter(recipe => selectedTags.every(tag => recipe.tags.includes(tag)))
          newFilteredRecipesState[category] = filteredCategory
        }

        console.log('new filtered recipes = ', newFilteredRecipesState)
        this.setState({
          filteredRecipes: newFilteredRecipesState
        })
      } else {
        console.log('new filtered recipes = ', newFilteredRecipesState)
        this.setState({
          filteredRecipes: newFilteredRecipesState
        })
      }
  }

  handleSearchChange = (e) => {
    let input = e.target.value.toLowerCase().trim()
    userInputSubject.next(input)
    this.applyBothFilters()
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

          <button className='dropdown-trigger btn' href='#' data-target='dropdown' id="filter-button"><span>Filter</span><i className="small material-icons">filter_list</i> </button>

          <ul id='dropdown' className='dropdown-content'>
            <li >
              <label>
                <input  id="dairy_free" onClick={this.filter} type="checkbox" />
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
                <input id="gluten_free" onClick={this.filter}  type="checkbox"  />
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
                <input id="no_bake" onClick={this.filter}  type="checkbox"  />
                <span>No Bake</span>
              </label>
            </li>
            <li>
              <label>
                <input id="sugar_free" onClick={this.filter}  type="checkbox"  />
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
