import React from 'react'
const axios = require('axios')
import BounceLoader from "react-spinners/BounceLoader"
import Category from './Category/Category'
import { BehaviorSubject, combineLatest } from "rxjs"
import './Dashboard.scss'
import Nav from '../Nav/Nav'

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
const appliedCategorySubject = new BehaviorSubject({
  breakfast: false, 
  lunch: false, 
  dinner: false, 
  side_dish: false, 
  dessert: false, 
  drinks: false, 
  other: false
})
let appliedCategory$ = appliedCategorySubject.asObservable()

appliedCategory$.subscribe(res => console.log(res))

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
      if (err.response.status === 401) {
        // unathenticated; redirect to log in 
        this.props.history.push('/login')
      }
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
      appliedCategory$,
      userInput$,
      unfilteredRecipes$
    ]).subscribe(([filters, categoryFilters, input, recipes]) => {
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

  calculateSelectedFiltersNumber() {
    let selectedFilters = 0
    for (const property in appliedFiltersSubject.getValue()) {
      if (appliedFiltersSubject.getValue()[property]) {
        selectedFilters++
      }
    }
    for (const property in appliedCategorySubject.getValue()) {
      if (appliedCategorySubject.getValue()[property]) {
        selectedFilters++
      }
    }
    selectedFilterSubject.next(selectedFilters)
  }

  filter = (e) => {
    let currentState = appliedFiltersSubject.getValue()[e.target.id]
    let filter = {
      ...appliedFiltersSubject.getValue(),
      [e.target.id]: !currentState,
    }
    appliedFiltersSubject.next(filter)
    this.calculateSelectedFiltersNumber()
  }

  filterByCategory = (e) => {
    let currentState = appliedCategorySubject.getValue()[e.target.id]
    let filter = {
      ...appliedCategorySubject.getValue(), 
      [e.target.id]: !currentState
    }
    appliedCategorySubject.next(filter)
    this.calculateSelectedFiltersNumber()
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
    const appliedCat = appliedCategorySubject.getValue();

    let filterArray = [
      {key: "dairy_free", name: 'Dairy Free'}, 
      {key: "easy", name: 'Easy'}, 
      {key: "gluten_free", name: 'Gluten Free'}, 
      {key: "healthy", name: 'Healthy'}, 
      {key: "keto", name: 'Keto'}, 
      {key: "no_bake", name: 'No Bake'}, 
      {key: "sugar_free", name: 'Sugar Free'}, 
      {key: "vegan", name: 'Vegan'}, 
      {key: "vegetarian", name: 'Vegetarian'}
    ];

    let filterCategoryArray = [
      {key: "breakfast", name: mealCategories['breakfast']},
      {key: "lunch", name: mealCategories['lunch']},
      {key: "dinner", name: mealCategories['dinner']}, 
      {key: "side_dish", name: mealCategories['side_dish']}, 
      {key: "dessert", name: mealCategories['dessert']},
      {key: "drinks", name: mealCategories['drinks']}, 
      {key: "other", name: mealCategories['other']}
    ];

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
            <ul id='dropdown' className='dropdown-content'>
              <p>Features</p>
                {
                  filterArray.map((item, index) => {
                    return (
                      <li key={index} >
                        <label>
                          <input 
                            checked={appliedFilt[item.key]} 
                            id={item.key} 
                            onClick={this.filter} 
                            type="checkbox" />
                          <span>{item.name}</span>
                          </label>
                      </li>
                    )
                  })
                }
              <p>Categories</p>
                {
                  filterCategoryArray.map((item, index) => {
                    return (
                      <li key={index}>
                        <label>
                            <input 
                              checked={appliedCat[item.key]} 
                              id={item.key} 
                              onClick={this.filterByCategory}
                              type="checkbox" />
                            <span>{item.name}</span>
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

export default(Dashboard);
