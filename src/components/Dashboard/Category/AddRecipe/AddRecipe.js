import React from 'react';
import M from 'materialize-css';
import Select from 'react-select';

class AddRecipe extends React.Component {

  state = {
    showModal: false
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
    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        padding: 10,
        '&:hover': {
          backgroundColor: '#e66c6c',
          color: 'white'
        }
      }),
    }
    return (
      <>
        <div
            className="addRecipe z-depth-4"
            id={id}
            onClick={this.addRecipe} >
            <i className="fas fa-plus-circle"></i>
        </div>
        {this.state.showModal ? 
            <div>
            <h1 className="Title"><i onClick={this.goBack} className="fas fa-chevron-circle-left"></i>Add Recipe</h1>
            <div className="recipe">
            <div>
                <div className="ingredients">
                  <h3>Ingredients <i
                    className="fas fa-edit"
                    onClick={this.showEditModal}>
                  </i></h3>
                  ingredients
                </div>
                <div className="directions">
                  <h3>Directions </h3>
                  directions
                </div>
                <div >
                  <h3>Category</h3>
                  <div className="select">
                      <Select 
                        defaultValue={{ label: this.state.category, value: this.state.category }}
                        onChange={this.updateCategoryState}
                        styles={customStyles} 
                        theme={theme => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary: 'dangerLight!important',
                          },
                          control: base => ({
                            ...base,
                            border: state.isFocused ? 0 : 0,
                            // This line disable the blue border
                            boxShadow: state.isFocused ? 0 : 0,
                            '&:hover': {
                              border: state.isFocused ? 0 : 0
                            }
                        })
                        })}
                        className="basic-single" 
                        options={options} />
                        <button className="waves-effect waves-light btn" onClick={this.updateCategory}>Save</button>
                    </div>
                </div>
              </div>
            </div>
          </div> : null
      }
      </>
      
    )
  }
}

export default AddRecipe;
