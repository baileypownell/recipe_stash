import React from 'react';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
const axios = require('axios');
import './Recipe.scss';
import BounceLoader from "react-spinners/BounceLoader";
import pot from '../../images/pot.svg';

import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

class Recipe extends React.Component {

  state = {
    title: null,
    ingredients: null,
    directions: null,
    recipeId: parseInt(this.props.location.pathname.split('/')[2]),
    loading: null,
    showConfirmation: false
  }

  goBack = () => {
    this.props.history.push('/dashboard')
  }

  componentDidMount() {
    this.setState({
      loading: true
    })
    // get data
    axios.get(`${process.env.API_URL}/specificRecipe/${this.props.userId}/${this.state.recipeId}`)
    .then(res => {
      this.setState({
        title: res.data[0].title,
        ingredients: res.data[0].ingredients,
        directions: res.data[0].directions,
        loading: false
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }

  deleteRecipe = () => {
    axios.delete(`${process.env.API_URL}/deleteRecipe/${this.state.recipeId}`)
    .then(res => {
      if (res) {
        console.log('here')
        this.setState({
          loading: false,
          showConfirmation: false
        });
        this.props.history.push('/dashboard')
      }
    })
    .catch((err) => {
      this.setState({
        loading: false
      })
    })
  }

  showConfirmationModal = () => {
    this.setState({
      showConfirmation: true
    })
  }

  hideConfirmationModal  = () => {
    this.setState({
      showConfirmation: false
    })
  }


  render() {
    const { ingredients, directions, title } = this.state;

    return (
      <>
      {this.state.loading ?
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
              <h2>Ingredients <i className="fas fa-edit"></i></h2>
              {ingredients}
            </div>
            <div className="directions">
              <h2>Directions <i className="fas fa-edit"></i></h2>
              {directions}
            </div>
            <div id="pot">
              <img src={pot} alt="cooking pot with lid cracked open" />
            </div>

          </div>
          <div className="bottom">
            <button onClick={this.showConfirmationModal}>Delete Recipe</button>
          </div>
        </div>
        {this.state.showConfirmation ?
          <ConfirmationModal
            text={'Are you sure you want to delete this recipe?'}
            confirmAction={this.deleteRecipe}
            closeModal={this.hideConfirmationModal}
            options={['Yes', 'No']} />
        : null}
        }
      </>
      }
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    userId: state.user.id
  }
}


export default withRouter(connect(mapStateToProps)(Recipe));