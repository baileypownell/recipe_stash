import React from 'react';
import { withRouter } from "react-router-dom";
const axios = require('axios');
import './Recipe.scss';
import BounceLoader from "react-spinners/BounceLoader";
import pot from '../../images/pot.svg';
import Modal from '../Modal/Modal';
import M from 'materialize-css';
import Select from 'react-select';

class Recipe extends React.Component {

  state = {
    title: null,
    ingredients: null,
    directions: null,
    recipeId: parseInt(this.props.location.pathname.split('/')[3]),
    loading: null,
    showConfirmation: false,
    showEditModal: false,
    category: ''
  }

  goBack = () => {
    this.props.history.push('/dashboard')
  }

  fetchData = () => {
    axios.get(`/recipe/${this.props.location.pathname.split('/')[3]}`)
    .then(res => {
      this.setState({
        title: res.data[0].title,
        ingredients: res.data[0].ingredients,
        directions: res.data[0].directions,
        category: res.data[0].category,
        loading: false
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }

  componentDidMount() {
    this.setState({
      loading: true
    })
    // get data
    this.fetchData();
  }

  deleteRecipe = () => {
    axios.delete(`/recipe/${this.state.recipeId}`)
    .then(res => {
      if (res) {
        M.toast({html: 'Recipe deleted.'})
        this.props.history.push('/dashboard')
      }
    })
    .catch((err) => {
      console.log(err)
      M.toast({html: 'There was an error.'})
    })
  }

  updateCategoryState = (e) => {
    this.setState({
      category: e.label
    })
  }

  updateCategory = () => {
    axios.put(`/recipe/${this.state.recipeId}`, {
      category: this.state.category
    })
    .then((res) => M.toast({html: 'Recipe category update.'}))
    .catch((err) => console.log(err))
  }

  showEditModal = () => {
    this.setState({
      showEditModal: true
    })
  }

  closeModal = () => {
    this.setState({
      showEditModal: false
    })
  }


  render() {
    const { ingredients, directions, title, recipeId, loading, showEditModal } = this.state;
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
      {loading ?
        <div className="BounceLoader">
          <BounceLoader
            size={100}
            color={"#689943"}
          />
        </div>
      :
        <>
        <h1 className="Title"><i onClick={this.goBack} className="fas fa-chevron-circle-left"></i>{title}</h1>
        <div className="recipe">
          <div>
            <div className="ingredients">
              <h3>Ingredients <i
                className="fas fa-edit"
                onClick={this.showEditModal}>
              </i></h3>
              {ingredients}
            </div>
            <div className="directions">
              <h3>Directions </h3>
              {directions}
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
            <div id="pot">
              <img src={pot} alt="cooking pot with lid cracked open" />
            </div>

          </div>
          <div className="bottom">
            <button className="waves-effect waves-light btn" onClick={this.deleteRecipe}>Delete Recipe</button>
          </div>
        </div>
        {showEditModal ?
          <Modal
            edit={true}
            closeModal={this.closeModal}
            fetchData={this.fetchData}
            directions={directions}
            title={title}
            ingredients={ingredients}
            recipeId={recipeId}
            />
        : null}
      </>
      }
      </>
    )
  }
}


export default withRouter(Recipe);
