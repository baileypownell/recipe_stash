import React from 'react';
import { withRouter } from "react-router-dom";
const axios = require('axios');
import './Recipe.scss';
import BounceLoader from "react-spinners/BounceLoader";
import M from 'materialize-css';

class Recipe extends React.Component {

  state = {
    recipe_title: null,
    ingredients: null,
    directions: null,
    recipeId: parseInt(this.props.location.pathname.split('/')[2]),
    showConfirmation: false,
    category: ''
  }

  goBack = () => {
    this.props.history.push('/dashboard')
  }

  fetchData = () => {
    axios.get(`/recipe/${this.props.location.pathname.split('/')[2]}`)
    .then(res => {
      this.setState({
        recipe_title: res.data[0].title,
        ingredients: res.data[0].ingredients,
        directions: res.data[0].directions,
        category: res.data[0].category,
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }

  componentDidMount() {
    let modal = document.querySelectorAll('.modal');
    M.Modal.init(modal, {
      opacity: 0.5
    });
    var select = document.querySelectorAll('select');
    M.FormSelect.init(select, {});
    // get data
    this.fetchData();
  }

  openModal = () => {
    let singleModalElem = document.querySelector(`.modal`);
    let instance = M.Modal.getInstance(singleModalElem); 
    // close modal
    instance.open();
    M.updateTextFields();
  }

  closeModal = () => {
    let singleModalElem = document.querySelector(`.modal`);
    let instance = M.Modal.getInstance(singleModalElem); 
    // close modal
    instance.close();
  }

  checkValidity = () => {
    const { directions, ingredients, recipe_title } = this.state;
    if (directions && ingredients && recipe_title) {
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
    .then(res => {
      if (res) {
        M.toast({html: 'Recipe deleted.'});
        this.closeModal();
        this.props.history.push('/dashboard')
      }
      
    })
    .catch((err) => {
      console.log(err)
      this.closeModal();
      M.toast({html: 'There was an error.'})
    })

  }

  updateCategoryState = (e) => {
    this.setState({
      category: e.label
    })
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkValidity());
  }

  updateCategory = () => {
    axios.put(`/recipe/${this.state.recipeId}`, {
      category: this.state.category
    })
    .then((res) => M.toast({html: 'Recipe category update.'}))
    .catch((err) => console.log(err))
  }

  updateRecipe = (e) => {
      e.preventDefault();
      axios.put(`/recipes`, {
        title: this.state.recipe_title,
        ingredients: this.state.ingredients,
        directions: this.state.directions,
        recipeId: this.props.recipeId
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

  render() {
    const { ingredients, directions, recipe_title, recipeId, category } = this.state;
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
          <h1 className="Title"><i onClick={this.goBack} className="fas fa-chevron-circle-left"></i>{recipe_title}</h1>
            <div className="recipe viewRecipe" >
              <div>
                  <h3>Title</h3>
                  <h2>{recipe_title}</h2>
                  <h3>Ingredients</h3>
                  <h2>{ingredients}</h2>
                  <h3>Directions </h3>
                  <h2>{directions}</h2>
                  <h3>Category</h3>
                  <h2>{category}</h2>
                <button onClick={this.openModal} className="btn modal-trigger">Edit <i className="fas fa-pen"></i></button>
              </div>
          </div>
          <div id={`${recipeId}_modal`} className="modal">
            <h1 className="Title">New Recipe</h1>
            <div className="recipe">
            <div>
                <div className="input-field">
                    <textarea onChange={this.updateInput} id="recipe_title" value={this.state.recipe_title || ''} className="materialize-textarea"></textarea>
                    <label className="active" htmlFor="recipe_title">Title</label>
                </div>
                <div className="input-field">
                    <textarea onChange={this.updateInput} id="ingredients" value={this.state.ingredients || ''} className="materialize-textarea minHeight"></textarea>
                    <label className="active" htmlFor="ingredients">Ingredients</label>
                </div>

                <div className="input-field">
                  <textarea onChange={this.updateInput} id="directions" value={this.state.directions || ''} className="materialize-textarea minHeight"></textarea>
                  <label className="active" htmlFor="directions">Directions</label>
                </div>
                  
                <div >
                  <h3>Category</h3>
                  <div className="select">
                    <select onChange={this.updateInput} id="category" value={this.state.category} >
                      {
                        options.map((val, index) => {
                          return <option key={index}>{val.label}</option>
                        })
                      }
                    </select>
                      
                  </div>
              </div>
              {/* <label>
                <input type="checkbox" class="filled-in" />
                <span>No baking required</span>
              </label> */}
                    
            </div>
            <div className="modal-close-buttons">
              <button id="delete" className="waves-effect waves-light btn" onClick={this.deleteRecipe}>Delete Recipe</button>
              <div>
                <button className="modal-close btn waves-effect waves-light grayBtn">Cancel</button>
                <button 
                  className={!this.state.recipeValid ? 'waves-effect waves-light btn disabled' : 'waves-effect waves-light btn enabled'}
                  disabled={!this.state.recipeValid} 
                  onClick={this.updateRecipe}>Update Recipe
                </button>
              </div>
            </div>
          </div> 
        </div>
    </>
    )
  }
}


export default withRouter(Recipe);
