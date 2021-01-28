import React from 'react'
import { withRouter } from "react-router-dom"
const axios = require('axios')
import './Recipe.scss'
import M from 'materialize-css'
import BounceLoader from "react-spinners/BounceLoader"
import Nav from '../Nav/Nav'

class Recipe extends React.Component {

  state = {
    loaded: false,
    recipe_title: null,
    ingredients: null,
    directions: null,
    recipe_title_edit: null, 
    ingredients_edit: null, 
    directions_edit: null,
    recipeId: parseInt(this.props.location.pathname.split('/')[2]),
    showConfirmation: false,
    category: '',
    category_edit: '', 
    recipe: null,
    tags: [
      {
        selected: false, 
        recipeTagPropertyName: 'no_bake',
        label: 'No Bake',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'easy',
        label: 'Easy',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'healthy',
        label: 'Healthy',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'gluten_free',
        label: 'Gluten-Free',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'dairy_free',
        label: 'Dairy-Free',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'sugar_free',
        label: 'Sugar-Free', 
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'vegetarian',
        label: 'Vegetarian', 
      }, 
      {
        selected: false, 
        recipeTagPropertyName: 'vegan',
        label: 'Vegan',
      },
      {
        selected: false,
        recipeTagPropertyName: 'keto',
        label: 'Keto',
      }
    ]
  }

  goBack = () => {
    this.props.history.push('/dashboard')
  }

  fetchData = () => {
    axios.get(`/recipe/${this.props.location.pathname.split('/')[2]}`)
    .then(res => {
      let recipe = res.data.recipe
      this.setState({
        recipe: recipe,
        recipe_title: recipe.title,
        recipe_title_edit: recipe.title,
        ingredients: recipe.ingredients,
        ingredients_edit: recipe.ingredients,
        directions: recipe.directions,
        directions_edit: recipe.directions,
        category: recipe.category,
        category_edit: recipe.category,
      })


      this.state.tags.forEach((tag, index) => {
        if (recipe.tags.includes(tag.recipeTagPropertyName)) {
            // 1. Make a shallow copy of the items
            let tags = [...this.state.tags];
            // 2. Make a shallow copy of the item you want to mutate
            let item = {...tags[index]};
            // 3. Replace the property you're intested in
            item.selected = true;
            // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
            tags[index] = item;
            // 5. Set the state to our new copy
            this.setState({tags});
        }
      })
      this.setState({
        loaded: true
      }, () => {
        let modal = document.querySelectorAll('.modal')
        M.Modal.init(modal, {
          opacity: 0.5
        })
        var select = document.querySelectorAll('select')
        M.FormSelect.init(select, {})
      })
    })
    .catch((err) => {
      console.log(err)
      if (err.response.status === 401) {
        // unathenticated; redirect to log in 
        this.props.history.push('/login')
      }
    })
  }

  componentDidMount() {
    this.fetchData()
  }

  openModal = () => {
    let singleModalElem = document.getElementById(`modal_${this.state.recipeId}`)
    let instance = M.Modal.getInstance(singleModalElem)
    instance.open()
    M.updateTextFields()
  }

  closeModal = () => {
    let singleModalElem = document.querySelector(`.modal`);
    let instance = M.Modal.getInstance(singleModalElem); 
    instance.close()
  } 

  checkValidity = () => {
    const { directions_edit, ingredients_edit, recipe_title_edit, category_edit } = this.state;
    if (directions_edit && ingredients_edit && recipe_title_edit, category_edit) {
      this.setState({
        recipeValid: true
      })
    } else {
      this.setState({
        recipeValid: false
      })
    }
  }

  deleteRecipe = () => {
    axios.delete(`/recipe/${this.state.recipeId}`)
    .then(() => {
        M.toast({html: 'Recipe deleted.'});
        this.closeModal()
        this.props.history.push('/dashboard')
    })
    .catch((err) => {
      console.log(err)
      this.closeModal()
      M.toast({html: 'There was an error.'})
    })

  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkValidity());
  }

  toggleTagSelectionStatus = (e) => {
    let index = e.target.id 
    // 1. Make a shallow copy of the items
    let tags = [...this.state.tags];
    // 2. Make a shallow copy of the item you want to mutate
    let item = {...tags[index]};
    // 3. Replace the property you're intested in
    let priorSelectedValue = item.selected
    item.selected = !priorSelectedValue;
    // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
    tags[index] = item;
    // 5. Set the state to our new copy
    this.setState({tags}, () => this.checkValidity());
  }

  updateRecipe = (e) => {
      e.preventDefault();
      let tags = this.state.tags;
      axios.put(`/recipe`, {
        title: this.state.recipe_title_edit,
        ingredients: this.state.ingredients_edit,
        directions: this.state.directions_edit,
        recipeId: this.state.recipeId,
        category: this.state.category,
        isNoBake: tags[0].selected,
        isEasy: tags[1].selected,
        isHealthy: tags[2].selected,
        isGlutenFree: tags[3].selected, 
        isDairyFree: tags[4].selected,
        isSugarFree: tags[5].selected, 
        isVegetarian: tags[6].selected, 
        isVegan: tags[7].selected,
        isKeto: tags[8].selected
      })
      .then(res => {
        if (res) {
          // close modal 
          this.closeModal();
          // Update recipe details to reflect the change
          this.fetchData();
          M.toast({html: 'Recipe updated.'})
        }
      })
      .catch((err) => {
        console.log(err)
        M.toast({html: 'There was an error updating the recipe.'})
      })
  }

  createMarkeup = (stateProperty) => {
    return {__html: 'a string'}
  }

  render() {
    const { ingredients, directions, recipe_title, recipeId, category, loaded } = this.state;
    const options = [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'dessert', label: 'Dessert' },
      { value: 'side_dish', label: 'Side Dish' },
      { value: 'drinks', label: 'Drinks' },
      { value: 'other', label: 'Other' }
    ]

    return (
      <>
      <Nav loggedIn={true}/>
        {
          loaded ? 
          <>
            <h1 className="Title"><i onClick={this.goBack} className="fas fa-chevron-circle-left"></i><span style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{__html: this.state.recipe_title}}/></h1>
            <div className="recipe viewRecipe" >
              <div>
                <div className="section">
                  <h3>Title</h3>
                  <div dangerouslySetInnerHTML={{__html: this.state.recipe_title}}/>
                </div>
                <div className="section">
                  <h3>Ingredients</h3>
                  <div dangerouslySetInnerHTML={{__html: this.state.ingredients}} />
                  {/* {(ingredients || '').split('\n').map(function(item, key) {
                      return (
                        <h2 key={key}>
                          {item}
                          <br/>
                        </h2>
                      )
                    })} */}
                </div>
                <div className="section">
                  <h3>Directions </h3>
                  <div dangerouslySetInnerHTML={{__html: this.state.directions}}/>
                  {/* {(directions || '').split('\n').map(function(item, key) {
                      return (
                        <h2 key={key}>
                          {item}
                          <br/>
                        </h2>
                      )
                    })} */}
                </div>
                <div className="section">
                  <h3>Category</h3>
                  <h2>{category}</h2>
                </div>
                <div className="section">
                  {
                    this.state.tags.map((tag) => {
                        return ( tag.selected ? <div className="chip z-depth-2">{ tag.label }</div> : null )
                    }) 
                  }
                </div>
                  
                <button onClick={this.openModal} className="btn">Edit <i className="fas fa-pen"></i></button>
              </div>
          </div>
          <div id={`modal_${recipeId}`} className="modal">
            <h1 className="Title">Edit Recipe</h1>
            <div className="recipe">
            <div>
                <div className="input-field">
                    <textarea onChange={this.updateInput} id="recipe_title_edit" value={this.state.recipe_title_edit || ''} className="materialize-textarea"></textarea>
                    <label className="active" htmlFor="recipe_title">Title</label>
                </div>
                <div className="input-field">
                    <textarea onChange={this.updateInput} id="ingredients_edit" value={this.state.ingredients_edit || ''} className="materialize-textarea minHeight"></textarea>
                    <label className="active" htmlFor="ingredients">Ingredients</label>
                </div>

                <div className="input-field">
                  <textarea onChange={this.updateInput} id="directions_edit" value={this.state.directions_edit || ''} className="materialize-textarea minHeight"></textarea>
                  <label className="active" htmlFor="directions">Directions</label>
                </div>
                  
                <div >
                  <h3>Category</h3>
                  <div className="select">
                    <select onChange={this.updateInput} id="category" value={this.state.category} >
                      {
                        options.map((val, index) => {
                          return <option val={val.label} key={index}>{val.label}</option>
                        })
                      }
                    </select>
                  </div>
              </div>

      

              <div className="recipeTags">
                <h3>Recipe Tags</h3>
                {
                  this.state.tags.map((tag, index) => {
                    return <div 
                      onClick={this.toggleTagSelectionStatus} 
                      id={index} 
                      className={`chip z-depth-2 ${this.state.recipe && this.state.tags[index].selected  ? "selectedTag" : "null"}`}
                      key={index}>
                        {tag.label}
                      </div>
                  })
                }
              </div>
                    
            </div>
            <div className="modal-close-buttons">
              <button id="delete" className="waves-effect waves-light btn" onClick={this.deleteRecipe}>Delete Recipe <i className="fas fa-trash"></i></button>
              <div>
                <button onClick={this.closeModal} className="btn waves-effect waves-light grayBtn">Cancel</button>
                <button 
                  className={!this.state.recipeValid ? 'waves-effect waves-light btn disabled' : 'waves-effect waves-light btn enabled'}
                  disabled={!this.state.recipeValid} 
                  onClick={this.updateRecipe}>Update Recipe
                </button>
              </div>
            </div>
          </div> 
        </div>
          </> :  
          <div className="BounceLoader">
            <BounceLoader
                size={100}
                color={"#689943"}
            />
          </div>
        }
        </>
    )
  }
}

export default withRouter(Recipe);
