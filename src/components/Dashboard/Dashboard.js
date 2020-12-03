import React from 'react';
const axios = require('axios');
import BounceLoader from "react-spinners/BounceLoader"
import { connect } from 'react-redux';
import Category from './Category/Category';
import { of, subscribe, merge, pipe, BehaviorSubject, Observable, combineLatest } from "rxjs";
import './Dashboard.scss';

let userInputSubject = new BehaviorSubject('')
let userInput$ = userInputSubject.asObservable()

const appliedFiltersSubject = new BehaviorSubject(null)
let appliedFilters$ = appliedFiltersSubject.asObservable()

let unfilteredRecipesSubject = new BehaviorSubject(null)
let unfilteredRecipes$ = unfilteredRecipesSubject.asObservable()


class Dashboard extends React.Component {

  state = {
    recipes_loaded: false,
    filteredRecipes: null,
    userInput: '',
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
    axios.get(`/recipe`)
    .then(res => {
      res.data.breakfast.sort(this.sortByTitle)
      res.data.lunch.sort(this.sortByTitle)
      res.data.dinner.sort(this.sortByTitle)
      res.data.side_dish.sort(this.sortByTitle)
      res.data.dessert.sort(this.sortByTitle)
      res.data.drinks.sort(this.sortByTitle)
      res.data.other.sort(this.sortByTitle)
      unfilteredRecipesSubject.next(res.data)
      this.setState({
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
    let faded = document.querySelectorAll('.fade')
    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
      faded[i].classList.add('fade-in')
      }
    }
    setTimeout(Appear, 300)


    // filter dropdown
    const dropdown = document.querySelector('.dropdown-trigger')
    M.Dropdown.init(dropdown, {
      closeOnClick: false,
    })

    let userInputSaved = window.sessionStorage.getItem('userInput')
    userInputSubject.next(userInputSaved)
    this.setState({
      userInput: userInputSaved
    })
    appliedFiltersSubject.next(this.state.filter)

    combineLatest([
      appliedFilters$,
      userInput$,
      unfilteredRecipes$
    ]).subscribe(([filters, input, recipes]) => {
      console.log(filters)
      console.log(input)
      //console.log(recipes)
      window.sessionStorage.setItem('userInput', input)
      let newFilteredRecipesState = {}
      for (const category in recipes) {
        let filteredCategory = recipes[category].filter(recipe => recipe.title.toLowerCase().includes(input))
        newFilteredRecipesState[category] = filteredCategory
      }
      console.log('newFilteredRecipesState', newFilteredRecipesState)

      let selectedTags = []
      for (const tag in filters) {
        if (filters[tag]) {
          selectedTags.push(tag)
        }
      }

      if (selectedTags.length) {
        // limit to only those recipes whose tags include each checked result from res (true) 
        for (const category in newFilteredRecipesState) {
          let filteredCategory = newFilteredRecipesState[category]
          .filter(recipe => recipe.tags.length >= 1)
          .filter(recipe => selectedTags.every(tag => recipe.tags.includes(tag)))
          newFilteredRecipesState[category] = filteredCategory
        }

        this.setState({
          filteredRecipes: newFilteredRecipesState
        }, () => console.log('running with filter'))
      } else {
        this.setState({
          filteredRecipes: newFilteredRecipesState
        }, () => console.log('running here'))
      }
    })
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
     })
  }

  updateDashboard = () => {
    this.fetchRecipes();
  }


  handleSearchChange = (e) => {
    this.setState({
      userInput: e.target.value
    })
    let input = e.target.value.toLowerCase().trim()
    userInputSubject.next(input)
  }

  render() {
    const { filteredRecipes, recipes_loaded } = this.state;

    return (
      <>
      <div className="title">
        <div>
          <h1>Recipe Box</h1>
          <div className="searchbar">
          <input onChange={this.handleSearchChange} value={this.state.userInput} type="text" placeholder="Find a recipe"></input><i className="fas fa-search"></i>

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
            id="side_dish"
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
