import React from 'react';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
const axios = require('axios');
import './Recipe.scss';
import BounceLoader from "react-spinners/BounceLoader";
import pot from '../../images/pot.svg';
import Modal from '../Modal/Modal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

class Recipe extends React.Component {

  state = {
    title: null,
    ingredients: null,
    directions: null,
    recipeId: parseInt(this.props.location.pathname.split('/')[2]),
    loading: null,
    showConfirmation: false,
    showEditModal: false
  }

  goBack = () => {
    this.props.history.push('/dashboard')
  }

  fetchData = () => {
    axios.get(`/recipes/${this.props.userId}/${this.state.recipeId}`)
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

  componentDidMount() {
    this.setState({
      loading: true
    })
    // get data
    this.fetchData();
  }

  deleteRecipe = () => {
    axios.delete(`/recipes/${this.state.recipeId}`)
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
    const { ingredients, directions, title, recipeId, loading, showConfirmation, showEditModal } = this.state;

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

const mapStateToProps = state => {
  return {
    userId: state.user.id
  }
}


export default withRouter(connect(mapStateToProps)(Recipe));
