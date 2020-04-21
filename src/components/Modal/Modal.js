import React from 'react';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import { connect } from 'react-redux';
import './Modal.scss';

class Modal extends React.Component {

  state = {
    title: '',
    category: this.props.category,
    ingredients: '',
    directions: '',
    loading: false,
    recipeValid: false
  }

  checkValidity = () => {
    const { directions, ingredients, title } = this.state;
    if (directions.length > 0 && ingredients.length > 0 && title.length > 0) {
      this.setState({
        recipeValid: true
      })
    } else {
      this.setState({
        recipeValid: false
      })
    }
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkValidity());
  }

  componentDidMount = () => {
    if (this.props.title) {
      this.setState({
        title: this.props.title
      })
    }
    if (this.props.ingredients) {
      this.setState({
        ingredients: this.props.ingredients
      })
    }
    if (this.props.directions) {
      this.setState({
        directions: this.props.directions
      })
    }
  }

  createRecipe = (e) => {
    e.preventDefault();
    this.setState({
      loading: true
    })
    axios.post(`/recipes`, {
      title: this.state.title,
      category: this.state.category,
      ingredients: this.state.ingredients,
      directions: this.state.directions,
      user_id: this.props.user_id
    })
    .then(res => {
      if (res) {
        this.setState({
          loading: false
        });
        this.props.closeModal();
        this.props.updateDashboard();
      }
    })
    .catch((err) => {
      this.setState({
        loading: false
      })
    })
  }

  updateRecipe = (e) => {
    e.preventDefault();
    this.setState({
      loading: true
    });
    axios.put(`/recipes`, {
      title: this.state.title,
      ingredients: this.state.ingredients,
      directions: this.state.directions,
      recipeId: this.props.recipeId
    })
    .then(res => {
      if (res) {
        this.setState({
          loading: false
        });
        this.props.closeModal();
        // Update recipe details to reflect the change
        this.props.fetchData();
      }
    })
    .catch((err) => {
      this.setState({
        loading: false
      })
    })
  }

  render() {
    const { recipeId, title, ingredients, directions, edit } = this.props;
    return (
      <div className="modal">
      <i
        onClick={this.props.closeModal}
        className="fas fa-times-circle">
      </i>
        <h2>{this.props.edit ? 'Edit' : 'Add'} Recipe</h2>
        <div>
          <form onSubmit={edit ? this.updateRecipe : this.createRecipe}>
          <label>
            <p>Title</p>
            <input
              type="text"
              id="title"
              onChange={this.updateInput}
              value={this.state.title}
              >
            </input>
          </label>
          <label>
            <p>Ingredients</p>
            <textarea
              className="tall"
              type="text"
              id="ingredients"
              onChange={this.updateInput}
              value={this.state.ingredients}
              >
            </textarea>
          </label>
          <label>
            <p>Directions</p>
            <textarea
              className="tall"
              type="text"
              id="directions"
              onChange={this.updateInput}
              value={this.state.directions}
              >
            </textarea>
          </label>
          <button
            className={!this.state.recipeValid ? 'disabled' : 'enabled'}
            disabled={!this.state.recipeValid}
          >{this.state.loading ?
            <ClipLoader
              size={30}
              color={"white"}
              loading={this.state.loading}
            /> :
            `${this.props.edit ? 'Edit' : 'Create'} Recipe`}</button>
          </form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user_id: state.user.id
  }
}

export default connect(mapStateToProps)(Modal);
