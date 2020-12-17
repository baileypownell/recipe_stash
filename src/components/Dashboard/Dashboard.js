import React from 'react'
const axios = require('axios')
import BounceLoader from "react-spinners/BounceLoader"
import { connect } from 'react-redux'
import Category from './Category/Category'
import { of, subscribe, merge, pipe, BehaviorSubject, combineLatest } from "rxjs"
import './Dashboard.scss';
import Nav from '../Nav/Nav';

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
  dessert: 'Desser', 
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
// let selectedFilters$ = selectedFiltersSubject.asObservable()

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
      console.log(err)
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
    !this.props.loggedIn ? this.props.history.push('/login') : null
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

    return (
      <>
      <Nav loggedIn={true}/>
      <div className="title">
        <div>
          <h1>Recipe Box</h1>
          <div className="searchbar">
          <input onChange={this.handleSearchChange} value={userInputSubject.getValue()} type="text" placeholder="Find a recipe"></input><i className="fas fa-search"></i>

          <button className='dropdown-trigger btn' href='#' data-target='dropdown' id="filter-button">
            <span>Filter</span>
            {
              selectedFilterSubject.getValue() > 0 ? `(${selectedFilterSubject.getValue()})` : <i  className="small material-icons">filter_list</i> 
            }
          </button>

          <ul id='dropdown' className='dropdown-content'>
            {
              Object.keys(appliedFiltersSubject.getValue()).map((filterCategory) => {
                return (
                <li key={filterCategory} >
                    <label>
                      <input 
                        checked={appliedFiltersSubject.getValue()?.[filterCategory]} 
                        id={filterCategory} 
                        onClick={this.filter} 
                        type="checkbox" />
                    <span>{filterTextMap[filterCategory]}</span>
                    </label>
                </li>
                )
              })
            }
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

const mapStateToProps = state => {
  return {
    loggedIn: state.loggedIn
  }
}

export default connect(mapStateToProps)(Dashboard);
