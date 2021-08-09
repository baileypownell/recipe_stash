import React from 'react'
import Category from './Category/Category'
import { BehaviorSubject, combineLatest } from "rxjs"
import { tap } from 'rxjs/operators'
import './Dashboard.scss'
import { SortedRecipeInterface, BaseStringAccessibleObjectBoolean, BaseStringAccessibleObjectString } from '../../services/recipe-services'
import { appear } from  '../../models/functions'
import { queryClient } from '../..'

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
  history?: any
  recipes: SortedRecipeInterface
}

type State = {
    filteredRecipes: SortedRecipeInterface | null
    gridView: boolean
}


class Dashboard extends React.Component<Props, State> {

  state = {
    filteredRecipes: null,
    gridView: true,
  }

  componentDidMount() {
    unfilteredRecipesSubject.next(this.props.recipes)
    let faded = document.querySelectorAll('.fade')
    setTimeout(() => appear(faded, 'fade-in'), 300);


    // filter dropdown
    const dropdown = document.querySelector('.dropdown-trigger')
    M.Dropdown.init(dropdown as Element, {
      closeOnClick: false,
    })

    let userInputSaved = window.sessionStorage.getItem('userInput')
    if (userInputSaved) {
      userInputSubject.next(userInputSaved)
    }
    
    // using saved features filter
    let userFiltersSaved = JSON.parse(window.sessionStorage.getItem('feature_filters') as string)
    if (userFiltersSaved) {
      appliedFiltersSubject.next(userFiltersSaved)  
      this.calculateSelectedFiltersNumber()
    }

    // using saved categories filter
    let userCategoryFiltersSaved: CategoryInterface = JSON.parse(window.sessionStorage.getItem('category_filters') as string)
    if (userCategoryFiltersSaved) {
      appliedCategorySubject.next(userCategoryFiltersSaved)
      this.calculateSelectedFiltersNumber()
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
    .pipe(tap(([filters, category, input, recipes]) => {
      window.sessionStorage.setItem('feature_filters', JSON.stringify(filters))
      window.sessionStorage.setItem('category_filters', JSON.stringify(category))
      window.sessionStorage.setItem('userInput', input)
    }))
    .subscribe(([filters, category, input, recipes]) => {
      console.log(category)
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

  calculateSelectedFiltersNumber(): void {
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
    let filter: CategoryInterface = {
      ...appliedCategorySubject.getValue(), 
      [(e.target as Element).id]: !currentState
    }
    appliedCategorySubject.next(filter)
    this.calculateSelectedFiltersNumber()
  }

  updateDashboard = () => {
    // this approach is fine only because there is only one place we are using this query
    queryClient.refetchQueries(['recipes'])
  }

  handleSearchChange = (e: { target: HTMLInputElement }) => {
    let input = e.target.value.toLowerCase()
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
    const { gridView, filteredRecipes } = this.state;
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
    ]

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
            <>
              <a onClick={this.toggleView} id="list" className="waves-effect btn-flat"><i id="list" className="fas fa-bars"></i></a>
              <a onClick={this.toggleView} id="grid" className="waves-effect btn-flat"><i id="grid" className="fas fa-th"></i></a>
              { filteredRecipes !== null ? 
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
                }) : null 
              }
          </>
      </div>
     </div>
    )
  }
}

export default(Dashboard);
