import React from 'react'
import BounceLoader from "react-spinners/BounceLoader"
import Category from './Category/Category'
import { BehaviorSubject, combineLatest } from "rxjs"
import { tap } from 'rxjs/operators'
import './Dashboard.scss'
import { RecipeService, SortedRecipeInterface, BaseStringAccessibleObjectBoolean, BaseStringAccessibleObjectString } from '../../services/recipe-services'
const appear = require('../../models/functions')

interface MealCategoriesInterface extends BaseStringAccessibleObjectString {
  breakfast: string
  lunch: string
  dinner: string
  side_dish: string
  dessert: string
  drinks: string
  other: string
}

// object for iterating through meal cateogries 
const mealCategories: MealCategoriesInterface = {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  side_dish: 'Side Dish',
  dessert: 'Dessert', 
  drinks: 'Drinks', 
  other: 'Other',
}

let userInputSubject: BehaviorSubject<string> = new BehaviorSubject('')
let userInput$ = userInputSubject.asObservable()

interface FilterInterface extends BaseStringAccessibleObjectBoolean {
    dairy_free: boolean
    easy: boolean
    gluten_free: boolean
    healthy: boolean
    keto: boolean
    no_bake: boolean
    sugar_free: boolean
    vegan: boolean
    vegetarian: boolean 
}

interface CategoryInterface extends BaseStringAccessibleObjectBoolean {
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  side_dish: boolean
  dessert: boolean 
  drinks: boolean 
  other: boolean
}

const appliedFiltersSubject: BehaviorSubject<FilterInterface> = new BehaviorSubject<FilterInterface>({
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
const appliedCategorySubject: BehaviorSubject<CategoryInterface> = new BehaviorSubject<CategoryInterface>({
  breakfast: false, 
  lunch: false, 
  dinner: false, 
  side_dish: false, 
  dessert: false, 
  drinks: false, 
  other: false
})
let appliedCategory$ = appliedCategorySubject.asObservable()

let unfilteredRecipesSubject: BehaviorSubject<null | SortedRecipeInterface> = new BehaviorSubject<null | SortedRecipeInterface>(null)
let unfilteredRecipes$ = unfilteredRecipesSubject.asObservable()

let selectedFilterSubject = new BehaviorSubject(0)

type Props = {
  history: any
}

type State = {
    recipes_loaded: boolean 
    filteredRecipes: SortedRecipeInterface | null
    gridView: boolean
}


class Dashboard extends React.Component<Props, State> {

  state = {
    recipes_loaded: false,
    filteredRecipes: null,
    gridView: true,
  }

  fetchRecipes = async() => {
    try {
      let recipes: SortedRecipeInterface = await RecipeService.getRecipes()
      unfilteredRecipesSubject.next(recipes)
    } catch (error) {
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

  componentDidMount() {
    this.fetchRecipes();
    let faded = document.querySelectorAll('.fade')
    setTimeout(appear(faded, 'fade-in'), 300);


    // filter dropdown
    const dropdown = document.querySelector('.dropdown-trigger')
    M.Dropdown.init(dropdown as Element, {
      closeOnClick: false,
    })

    let userInputSaved = window.sessionStorage.getItem('userInput')
    if (userInputSaved) {
      userInputSubject.next(userInputSaved)
    }
    
    let userFiltersSaved = JSON.parse(window.sessionStorage.getItem('filters') as string)
    if (userFiltersSaved) {
      this.calculateSelectedFiltersNumber()
      appliedFiltersSubject.next(userFiltersSaved)  
    }

    // set gridView 
    let gridView = JSON.parse(window.sessionStorage.getItem('gridView') as string)
    this.setState({
      gridView
    })
    
    
    combineLatest([
      appliedFilters$,
      appliedCategory$,
      userInput$,
      unfilteredRecipes$
    ])
    .pipe(tap(([filters, _, input, recipes]) => {
      window.sessionStorage.setItem('filters', JSON.stringify(filters))
      window.sessionStorage.setItem('userInput', input)
    }))
    .subscribe(([filters, _, input, recipes]) => {
      let newFilteredRecipesState: SortedRecipeInterface = {} as any
      for (const category in recipes) {
        let filteredCategory = recipes[category].filter(recipe => recipe.title.toLowerCase().includes(input))
        newFilteredRecipesState[category] = filteredCategory
      }

      let selectedTags: string[] = []
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
          .filter(recipe => selectedTags.every(tag => recipe.tags.includes(tag as any)))
          newFilteredRecipesState[category] = filteredCategory
        }
      } 

      this.setState({
        filteredRecipes: newFilteredRecipesState
      })
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

  filter = (e: React.MouseEvent<HTMLElement>) => {
    let currentState = appliedFiltersSubject.getValue()[(e.target as Element).id]
    let filter = {
      ...appliedFiltersSubject.getValue(),
      [(e.target as Element).id]: !currentState,
    }
    appliedFiltersSubject.next(filter)
    this.calculateSelectedFiltersNumber()
  }

  filterByCategory = (e: React.MouseEvent<HTMLElement>) => {
    let currentState = appliedCategorySubject.getValue()[(e.target as HTMLInputElement).id]
    let filter = {
      ...appliedCategorySubject.getValue(), 
      [(e.target as Element).id]: !currentState
    }
    appliedCategorySubject.next(filter)
    this.calculateSelectedFiltersNumber()
  }

  updateDashboard = () => {
    this.fetchRecipes()
  }

  handleSearchChange = (e: { target: HTMLInputElement }) => {
    let input = e.target.value.toLowerCase().trim()
    userInputSubject.next(input)
  }

  toggleView = (e: React.MouseEvent<HTMLElement>) => {    
    let val: boolean = !!((e.target as Element).id === 'grid')
    this.setState({
      gridView: val
    }, () => {
      window.sessionStorage.setItem('gridView', val.toString())
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
      <div>
        <div className="title-bar">
          <div>
            <h1>Recipe Box</h1>
            <div className="searchbar">
                <input 
                  onChange={this.handleSearchChange} 
                  value={userInputSubject.getValue()} 
                  type="text" placeholder="Find a recipe">
                </input>
                <i className="fas fa-search"></i>

                <button className='dropdown-trigger btn' data-target='dropdown' id="filter-button">
                  <span>Filter</span>
                  {
                    selectedFilterSubject.getValue() > 0 ? `(${selectedFilterSubject.getValue()})` : <i  className="small material-icons">filter_list</i> 
                  }
                </button>
                <ul id='dropdown' className='dropdown-content'>
                  <p>Features</p>
                    {filterArray.map((item, index) => {
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
                    {filterCategoryArray.map((item, index) => {
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
                        recipes={(filteredRecipes as unknown as SortedRecipeInterface)[mealCat]}
                        updateDashboard={this.updateDashboard}
                      >
                      </Category>                       
                  )
                })
              }
            </>
          }
      </div>
     </div>
    )
  }
}

export default(Dashboard);
