import React from 'react'
const axios = require('axios')
import BounceLoader from "react-spinners/BounceLoader"
import Category from './Category/Category'
import { BehaviorSubject, combineLatest } from "rxjs"
import './Dashboard.scss'
import Nav from '../Nav/Nav'

// object for accessing human readable versions of recipe tag categories
const filterTextMap = {
  dairy_free: 'Dairy Free', 
  easy: 'Easy',
  gluten_free: 'Gluten Free', 
  healthy: 'Healthy', 
  keto: 'Keto', 
  no_bake: 'No Bake', 
  sugar_free: 'Sugar Free', 
  vegan: 'Vegan', 
  vegetarian: 'Vegetarian'
}

// object for iterating through meal cateogries 
const mealCategories = {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  side_dish: 'Side Dish',
  dessert: 'Dessert', 
  drinks: 'Drinks', 
  other: 'Other',
}

let userInputSubject = new BehaviorSubject('')
let userInput$ = userInputSubject.asObservable()

const appliedFiltersSubject = new BehaviorSubject({
  dairy_free: false, 
  easy: false, 
  gluten_free: false, 
  healthy: false, 
  keto: false, 
  no_bake: false, 
  sugar_free: false, 
  vegan: false, 
  vegetarian: false, 
})
let appliedFilters$ = appliedFiltersSubject.asObservable()

let unfilteredRecipesSubject = new BehaviorSubject(null)
let unfilteredRecipes$ = unfilteredRecipesSubject.asObservable()

let selectedFilterSubject = new BehaviorSubject(0)

class Dashboard extends React.Component {

  state = {
    recipes_loaded: false,
    filteredRecipes: null,
  }

  fetchRecipes = () => {
    axios.get(`/recipe`)
    .then(res => {
      for (const category in res.data) {
        let sortedCategory = res.data[category].sort(this.sortByTitle)
        res.data[category] = sortedCategory
      }
      unfilteredRecipesSubject.next(res.data)
      this.setState({
        recipes_loaded: true
      })
    })
    .catch((err) => {
      this.setState({
        recipes_loaded: false
      })
    })    
  }

  sortByTitle(a, b) {
    if (a.title.toLowerCase() > b.title.toLowerCase()) {
      return 1
    } else if (a.title.toLowerCase() < b.title.toLowerCase() ) {
      return -1
    }
    return 0 
  }

  componentDidMount() {
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
    if (userInputSaved) {
      userInputSubject.next(userInputSaved)
    }
    
    let userFiltersSaved = JSON.parse(window.sessionStorage.getItem('filters'))
    if (userFiltersSaved) {
      let selectedFilters = 0
      for (const property in userFiltersSaved) {
        if (userFiltersSaved[property]) {
          selectedFilters++
        }
      }
      selectedFilterSubject.next(selectedFilters)
      appliedFiltersSubject.next(userFiltersSaved)  
    }
    
    combineLatest([
      appliedFilters$,
      userInput$,
      unfilteredRecipes$
    ]).subscribe(([filters, input, recipes]) => {
      window.sessionStorage.setItem('filters', JSON.stringify(filters))
      window.sessionStorage.setItem('userInput', input)
      let newFilteredRecipesState = {}
      for (const category in recipes) {
        let filteredCategory = recipes[category].filter(recipe => recipe.title.toLowerCase().includes(input))
        newFilteredRecipesState[category] = filteredCategory
      }

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
        })
      } else {
        this.setState({
          filteredRecipes: newFilteredRecipesState
        })
      }
    })
  }

  filter = (e) => {
    let currentState = appliedFiltersSubject.getValue()[e.target.id]
    let filter = {
      ...appliedFiltersSubject.getValue(),
      [e.target.id]: !currentState,
    }
    appliedFiltersSubject.next(filter)
    let selectedFilters = 0
    for (const property in filter) {
      if (filter[property]) {
        selectedFilters++
      }
    }
    selectedFilterSubject.next(selectedFilters)
  }

  updateDashboard = () => {
    this.fetchRecipes();
  }


  handleSearchChange = (e) => {
    let input = e.target.value.toLowerCase().trim()
    userInputSubject.next(input)
  }

  render() {
    const { filteredRecipes, recipes_loaded } = this.state;
    const appliedFilt = appliedFiltersSubject.getValue();

    let filterArray = ["dairy_free", "easy", "gluten_free", "healthy", "keto", "no_bake", "sugar_free", "vegan", "vegetarian"];

    return (
      <>
        <Nav loggedIn={true}/>
        <div className="title">
          <div>
            <h1>Recipe Box</h1>
            <div className="searchbar">
            <input 
              onChange={this.handleSearchChange} 
              value={userInputSubject.getValue()} 
              type="text" placeholder="Find a recipe">
            </input>
            <i className="fas fa-search"></i>

            <button className='dropdown-trigger btn' href='#' data-target='dropdown' id="filter-button">
              <span>Filter</span>
              {
                selectedFilterSubject.getValue() > 0 ? `(${selectedFilterSubject.getValue()})` : <i  className="small material-icons">filter_list</i> 
              }
            </button>

            {/* This is purposefully not DRY, as iterating over an array, Map, or object resulted in unexpected listitem re-ordering in iOS Chrome */}
            <ul id='dropdown' className='dropdown-content'>
              <li key={filterArray[0]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[0]]} 
                    id={filterArray[0]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[0]]}</span>
                  </label>
              </li>
              <li key={filterArray[1]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[1]]} 
                    id={filterArray[1]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[1]]}</span>
                  </label>
              </li>
              <li key={filterArray[2]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[2]]} 
                    id={filterArray[2]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[2]]}</span>
                  </label>
              </li>
              <li key={filterArray[3]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[3]]} 
                    id={filterArray[3]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[3]]}</span>
                  </label>
              </li>
              <li key={filterArray[4]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[4]]} 
                    id={filterArray[4]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[4]]}</span>
                  </label>
              </li>
              <li key={filterArray[5]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[5]]} 
                    id={filterArray[5]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[5]]}</span>
                  </label>
              </li>
              <li key={filterArray[6]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[6]]} 
                    id={filterArray[6]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[6]]}</span>
                  </label>
              </li>
              <li key={filterArray[7]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[7]]} 
                    id={filterArray[7]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[7]]}</span>
                  </label>
              </li>
              <li key={filterArray[8]} >
                <label>
                  <input 
                    checked={appliedFilt[filterArray[8]]} 
                    id={filterArray[8]} 
                    onClick={this.filter} 
                    type="checkbox" />
                  <span>{filterTextMap[filterArray[8]]}</span>
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
              {
                Object.keys(mealCategories).map(mealCat => {
                  return <Category
                    title={mealCategories[mealCat]}
                    id={mealCat}
                    recipes={filteredRecipes[mealCat]}
                    updateDashboard={this.updateDashboard}
                  >
                  </Category>
                })
              }
            </>
          }
      </div>
     </>
    )
  }
}

export default(Dashboard);
