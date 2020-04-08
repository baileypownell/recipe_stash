import React from 'react';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import { connect } from 'react-redux';
import './Modal.scss';

class Modal extends React.Component {

  state = {
    title: null,
    category: this.props.category,
    ingredients: null,
    description: null,
    loading: false
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  createRecipe = (e) => {
    e.preventDefault();
    this.setState({
      loading: true
    })
    axios.post(`${process.env.API_URL}/createRecipe`, {
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

  render() {
    return (
      <div className="modal">
      <i onClick={this.props.closeModal} className="fas fa-times-circle"></i>
        <h2>Add Recipe</h2>
        <div>
          <form onSubmit={this.createRecipe}>
          <label>
            <p>Title</p>
            <input type="text" id="title" onChange={this.updateInput}></input>
          </label>
          <label>
            <p>Ingredients</p>
            <textarea className="tall" type="text" id="ingredients" onChange={this.updateInput}></textarea>
          </label>
          <label>
            <p>Directions</p>
            <textarea className="tall" type="text" id="directions" onChange={this.updateInput}></textarea>
          </label>
          <button>{this.state.loading ?
            <ClipLoader
              size={30}
              color={"#689943"}
              loading={this.state.loading}
            /> :
            'Create Recipe'}</button>
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
