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

let unfilteredRecipesSubject = new BehaviorSubject(null)
let unfilteredRecipes$ = unfilteredRecipesSubject.asObservable()

let selectedFilterSubject = new BehaviorSubject(0)

class Dashboard extends React.Component {

  state = {
    recipes_loaded: false,
    filteredRecipes: null,
    gridView: true,
  }

  fetchRecipes = async() => {
    try {
      let recipe = await axios.get(`/recipe`)
      for (const category in recipe.data) {
        let sortedCategory = recipe.data[category].sort(this.sortByTitle)
        recipe.data[category] = sortedCategory
      }
      unfilteredRecipesSubject.next(recipe.data)
    } catch (error) {
      console.log(error)
      if (error.response?.status === 401) {
        // unathenticated; redirect to log in 
        this.props.history.push('/login')
      }
    } finally {
      this.setState({
        recipes_loaded: !!unfilteredRecipesSubject.getValue()
      })
    }
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
    let appear = () => {
      faded.forEach((el => el.classList.add('fade-in')))
    }
    setTimeout(appear, 300);


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
      this.calculateSelectedFiltersNumber()
      appliedFiltersSubject.next(userFiltersSaved)  
    }

    // set gridView 
    let gridView = JSON.parse(window.sessionStorage.getItem('gridView'))
    this.setState({
      gridView
    })
    
    
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

  toggleView = (e) => {    
    let val = !!(e.target.id === 'grid')
    this.setState({
      gridView: val
    }, () => {
      window.sessionStorage.setItem('gridView', val)
    })
  }

  render() {
    const { filteredRecipes, recipes_loaded, gridView } = this.state;
    const appliedFilt = appliedFiltersSubject.getValue();
    const appliedCat = appliedCategorySubject.getValue();

    let allFalse = true
    for (const [i, cat] of Object.entries(appliedCat).entries()) {
      if (cat[1]) {
        allFalse = false
        break
      }
    }

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
              <a onClick={this.toggleView} id="list" className="waves-effect btn-flat"><i id="list" className="fas fa-bars"></i></a>
              <a onClick={this.toggleView} id="grid" className="waves-effect btn-flat"><i id="grid" className="fas fa-th"></i></a>
              {
                Object.keys(mealCategories).map(mealCat => {
                  return (
                      <Category
                        title={mealCategories[mealCat]}
                        id={mealCat}
                        key={mealCat}
                        visibility={allFalse ? 'true' : `${appliedCat[mealCat]}`}
                        gridView={gridView}
                        recipes={filteredRecipes[mealCat]}
                        updateDashboard={this.updateDashboard}
                      >
                      </Category>                       
                  )
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
