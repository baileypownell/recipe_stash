import React from 'react';
import M from 'materialize-css';

class AddRecipe extends React.Component {

  state = {
    showModal: false
  }

  componentDidMount() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {
      opacity: 0.5
    });

    var select = document.querySelectorAll('select');
    M.FormSelect.init(select, {});
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  addRecipe = () => {
    this.setState({
      showModal: true
    })
  }
  render() {
    const { id, category } = this.props;
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
            data-target="modal1"
            className="addRecipe z-depth-4 modal-trigger"
            id={id}
            onClick={this.addRecipe} >
            <i className="fas fa-plus-circle"></i>
        </div>

            <div id="modal1" className="modal">
              
              <h1 className="Title">New Recipe</h1>
              <div className="recipe">
              <div>
                  <div className="input-field">
                      <textarea id="title" className="materialize-textarea"></textarea>
                      <label htmlFor="title">Title</label>
                  </div>
                  <div className="input-field">
                      <textarea id="ingredients" className="materialize-textarea"></textarea>
                      <label htmlFor="ingredients">Ingredients</label>
                  </div>

                  <div className="input-field">
                    <textarea id="directions" className="materialize-textarea"></textarea>
                    <label htmlFor="directions">Directions</label>
                  </div>
              
                  <div >
                    <h3>Category</h3>
                    <div className="select">
                      <select>
                        {
                          options.map((val, index) => {
                            return <option key={index}>{val.label}</option>
                          })
                        }
                      </select>
                        
                    </div>
                </div>
                <label>
                  <input type="checkbox" class="filled-in" />
                  <span>No baking required</span>
                </label>
                
              </div>
              <button className="waves-effect waves-light btn" onClick={this.updateCategory}>Save</button>
            </div>
          </div> 
      </>
      
    )
  }
}

export default AddRecipe;
