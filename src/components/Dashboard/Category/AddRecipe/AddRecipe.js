import React from 'react';
import M from 'materialize-css';
import './AddRecipe.scss';
const axios = require('axios');

class AddRecipe extends React.Component {

  state = {
    recipe_title: null,
    ingredients: null,
    directions: null,
    category: this.props.category,
    recipeValid: false,
    tags: [
      {
        selected: false, 
        label: 'No Bake',
      }, 
      {
        selected: false,
        label: 'Easy',
      }, 
      {
        selected: false,
        label: 'Healthy',
      }, 
      {
        selected: false,
        label: 'Gluten-Free',
      }, 
      {
        selected: false,
        label: 'Dairy-Free',
      }, 
      {
        selected: false,
        label: 'Sugar-Free', 
      }, 
      {
        selected: false,
        label: 'Vegetarian', 
      }, 
      {
        selected: false, 
        label: 'Vegan',
      },
      {
        selected: false,
        label: 'Keto',
      }
    ]
  }

  componentDidMount() {
    const modal = document.querySelectorAll('.modal');
    M.Modal.init(modal, {
      opacity: 0.5
    });

    const select = document.querySelectorAll('select');
    M.FormSelect.init(select, {});

    // category selector 
    const categorySelector = document.querySelectorAll('.collapsible');
    M.Collapsible.init(categorySelector, {});

    // recipe category chip tags 
    const chips = document.querySelectorAll('.chips');
    M.Chips.init(chips, {});
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

  clearState = () => {
    this.setState({
      recipe_title: null,
      ingredients: null,
      directions: null,
    })
  }

  createRecipe = (e) => {
    e.preventDefault();
    let tags = this.state.tags
    axios.post(`/recipes`, {
      title: this.state.recipe_title,
      category: this.state.category,
      ingredients: this.state.ingredients,
      directions: this.state.directions,
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
        var singleModalElem = document.querySelector(`#${this.state.category}_modal`);
        var instance = M.Modal.getInstance(singleModalElem); 
        // close modal
        instance.close();

        // clear modal state 
        this.clearState();

        this.props.updateDashboard();
        M.toast({html: 'Recipe added.'})
      }
    })
    .catch((err) => {
      console.log(err)
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
    this.setState({tags});
  }

  
  render() {
    const { id } = this.props;
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
        <div
            data-target={`${this.state.category}_modal`}
            className="addRecipe z-depth-4 modal-trigger"
            id={id}
             >
            <i className="fas fa-plus-circle"></i>
        </div>

            <div id={`${this.state.category}_modal`} className="modal">
              
              <h1 className="Title">New Recipe</h1>
              <div className="recipe">
              <div>
                  <div className="input-field">
                      <textarea onChange={this.updateInput} id="recipe_title" value={this.state.recipe_title || ''} className="materialize-textarea"></textarea>
                      <label htmlFor="recipe_title">Title</label>
                  </div>
                  <div className="input-field">
                      <textarea onChange={this.updateInput} id="ingredients" value={this.state.ingredients || ''} className="materialize-textarea minHeight"></textarea>
                      <label htmlFor="ingredients">Ingredients</label>
                  </div>

                  <div className="input-field">
                    <textarea onChange={this.updateInput} id="directions" value={this.state.directions || ''} className="materialize-textarea minHeight"></textarea>
                    <label htmlFor="directions">Directions</label>
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

                <ul className="collapsible">
                  <li>
                    <div className="collapsible-header"><p>Recipe Tags</p></div>
                    <div className="collapsible-body">
                        {
                          this.state.tags.map((tag, index) => {
                            return <div 
                              onClick={this.toggleTagSelectionStatus} 
                              id={index} 
                              className={`chip z-depth-2 ${this.state.tags[index].selected ? "selectedTag" : "null"}`}
                              key={index}>
                                {tag.label}
                              </div>
                          })
                        }
                    </div>
                  </li>
                </ul>
    
                
                
              </div>
              <div className="modal-close-buttons">
                <button className="modal-close btn waves-effect waves-light grayBtn">Cancel</button>
                <button 
                  className={!this.state.recipeValid ? 'waves-effect waves-light btn disabled' : 'waves-effect waves-light btn enabled'}
                  disabled={!this.state.recipeValid} 
                  onClick={this.createRecipe}>Save
                 </button>
              </div>
              
            </div>
          </div> 
      </>
      
    )
  }
}

export default AddRecipe;
