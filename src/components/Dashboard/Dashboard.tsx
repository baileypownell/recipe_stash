import React from 'react'
import Category from './Category/Category'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { tap } from 'rxjs/operators'
import './Dashboard.scss'
import { SortedRecipeInterface, BaseStringAccessibleObjectBoolean, BaseStringAccessibleObjectString } from '../../services/recipe-services'
import { queryClient } from '../..'
import { AddRecipeMutationParam } from '../RecipeCache/RecipeCache'

interface MealCategoriesInterface extends BaseStringAccessibleObjectString {
  breakfast: string
  lunch: string
  dinner: string
  side_dish: string
  dessert: string
  drinks: string
  other: string
}

export type MealCategoriesType = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    side_dish: 'Side Dish',
    dessert: 'Dessert',
    drinks: 'Drinks',
    other: 'Other',
}

// object for iterating through meal cateogries
const mealCategories: MealCategoriesInterface = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  side_dish: 'Side Dish',
  dessert: 'Dessert',
  drinks: 'Drinks',
  other: 'Other'
}

const userInputSubject: BehaviorSubject<string> = new BehaviorSubject('')
const userInput$ = userInputSubject.asObservable()

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
  vegetarian: false
})
const appliedFilters$ = appliedFiltersSubject.asObservable()
const appliedCategorySubject: BehaviorSubject<CategoryInterface> = new BehaviorSubject<CategoryInterface>({
  breakfast: false,
  lunch: false,
  dinner: false,
  side_dish: false,
  dessert: false,
  drinks: false,
  other: false
})
const appliedCategory$ = appliedCategorySubject.asObservable()

const unfilteredRecipesSubject: BehaviorSubject<null | SortedRecipeInterface> = new BehaviorSubject<null | SortedRecipeInterface>(null)
const unfilteredRecipes$ = unfilteredRecipesSubject.asObservable()

const selectedFilterSubject = new BehaviorSubject(0)

type Props = {
  history?: any
  addRecipeMutation: any
  fetchRecipes: Function
  recipes: SortedRecipeInterface
}

type State = {
    filteredRecipes: SortedRecipeInterface | null
    gridView: boolean
}

class Dashboard extends React.Component<Props, State> {
  state = {
    filteredRecipes: null,
    gridView: true
  }

  addRecipe = async (recipeInput: AddRecipeMutationParam) => {
    await this.props.addRecipeMutation(recipeInput)
    const current: SortedRecipeInterface = queryClient.getQueryData('recipes')
    unfilteredRecipesSubject.next(current)
  }

  componentDidMount () {
    unfilteredRecipesSubject.next(this.props.recipes)
    // filter dropdown
    const dropdown = document.querySelector('.dropdown-trigger')
    M.Dropdown.init(dropdown as Element, {
      closeOnClick: false
    })

    const userInputSaved = window.sessionStorage.getItem('userInput')
    if (userInputSaved) {
      userInputSubject.next(userInputSaved)
    }

    // using saved features filter
    const userFiltersSaved = JSON.parse(window.sessionStorage.getItem('feature_filters') as string)
    if (userFiltersSaved) {
      appliedFiltersSubject.next(userFiltersSaved)
      this.calculateSelectedFiltersNumber()
    }

    // using saved categories filter
    const userCategoryFiltersSaved: CategoryInterface = JSON.parse(window.sessionStorage.getItem('category_filters') as string)
    if (userCategoryFiltersSaved) {
      appliedCategorySubject.next(userCategoryFiltersSaved)
      this.calculateSelectedFiltersNumber()
    }

    // set gridView
    const gridView = JSON.parse(window.sessionStorage.getItem('gridView') as string)
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
        const newFilteredRecipesState: SortedRecipeInterface = {} as any
        for (const category in recipes) {
          const filteredCategory = recipes[category].filter(recipe => recipe.title.toLowerCase().includes(input))
          newFilteredRecipesState[category] = filteredCategory
        }

        const selectedTags: string[] = []
        for (const tag in filters) {
          if (filters[tag]) {
            selectedTags.push(tag)
          }
        }

        if (selectedTags.length) {
        // limit to only those recipes whose tags include each checked result from res (true)
          for (const category in newFilteredRecipesState) {
            const filteredCategory = newFilteredRecipesState[category]
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

  calculateSelectedFiltersNumber (): void {
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
    const currentState = appliedFiltersSubject.getValue()[(e.target as Element).id]
    const filter = {
      ...appliedFiltersSubject.getValue(),
      [(e.target as Element).id]: !currentState
    }
    appliedFiltersSubject.next(filter)
    this.calculateSelectedFiltersNumber()
  }

  filterByCategory = (e: React.MouseEvent<HTMLElement>) => {
    const currentState = appliedCategorySubject.getValue()[(e.target as HTMLInputElement).id]
    const filter: CategoryInterface = {
      ...appliedCategorySubject.getValue(),
      [(e.target as Element).id]: !currentState
    }
    appliedCategorySubject.next(filter)
    this.calculateSelectedFiltersNumber()
  }

  handleSearchChange = (e: { target: HTMLInputElement }) => {
    const input = e.target.value.toLowerCase()
    userInputSubject.next(input)
  }

  toggleView = (e: React.MouseEvent<HTMLElement>) => {
    const val: boolean = !!((e.target as Element).id === 'grid')
    this.setState({
      gridView: val
    }, () => {
      window.sessionStorage.setItem('gridView', val.toString())
    })
  }

  render () {
    const { gridView, filteredRecipes } = this.state
    const appliedFilt = appliedFiltersSubject.getValue()
    const appliedCat = appliedCategorySubject.getValue()

    let allFalse = true
    for (const [i, cat] of Object.entries(appliedCat).entries()) {
      if (cat[1]) {
        allFalse = false
        break
      }
    }

    const filterArray = [
      { key: 'dairy_free', name: 'Dairy Free' },
      { key: 'easy', name: 'Easy' },
      { key: 'gluten_free', name: 'Gluten Free' },
      { key: 'healthy', name: 'Healthy' },
      { key: 'keto', name: 'Keto' },
      { key: 'no_bake', name: 'No Bake' },
      { key: 'sugar_free', name: 'Sugar Free' },
      { key: 'vegan', name: 'Vegan' },
      { key: 'vegetarian', name: 'Vegetarian' }
    ]

    const filterCategoryArray = [
      { key: 'breakfast', name: mealCategories.breakfast },
      { key: 'lunch', name: mealCategories.lunch },
      { key: 'dinner', name: mealCategories.dinner },
      { key: 'side_dish', name: mealCategories.side_dish },
      { key: 'dessert', name: mealCategories.dessert },
      { key: 'drinks', name: mealCategories.drinks },
      { key: 'other', name: mealCategories.other }
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
                    selectedFilterSubject.getValue() > 0
                      ? `(${selectedFilterSubject.getValue()})`
                      : <i className="small material-icons">filter_list</i>
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
              { filteredRecipes !== null
                ? Object.keys(mealCategories).map(mealCat => {
                  return (
                      <Category
                        title={mealCategories[mealCat]}
                        id={mealCat}
                        key={mealCat}
                        visibility={allFalse ? 'true' : `${appliedCat[mealCat]}`}
                        gridView={gridView}
                        recipes={(filteredRecipes as unknown as SortedRecipeInterface)[mealCat]}
                        addRecipe={this.addRecipe}
                      >
                      </Category>
                  )
                })
                : null
              }
          </>
      </div>
     </div>
    )
  }
}

export default (Dashboard)
