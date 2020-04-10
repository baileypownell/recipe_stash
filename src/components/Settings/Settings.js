import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
import { withRouter } from "react-router-dom";
const axios = require('axios');
import EditProfileModal from './EditProfileModal/EditProfileModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import './Settings.scss';

class Settings extends React.Component {

  state = {
    showModal: false,
    property: null,
    showConfirmation: false
  }

  logout = () => {
    this.props.logout();
    this.props.history.push('/home')
  }

  // showModal = (e) => {
  //   this.setState({
  //     showModal: true,
  //     property: e.target.id
  //   })
  // }
  //
  // closeModal = (e) => {
  //   this.setState({
  //     showModal: false
  //   })
  // }

  toggleModal = e => {
    this.setState(prevState => ({
      showModal: !prevState.showModal
    }))
  }

  toggleConfirmationModal = () => {
    this.setState(prevState => ({
      showConfirmation: !prevState.showConfirmation
    }))
  }

  deleteAccount = () => {
    axios.delete(`${process.env.API_URL}/deleteAccount/${this.props.id}`)
    .then((res) => {
      axios.delete(`${process.env.API_URL}/deleteAllUserRecipes/${this.props.id}`)
      .then(res => {
        // update redux
        this.props.logout();
        this.props.history.push('/home');
      })
    })
    .then((res) => {
      //
    })
    .catch(err => console.log(err))
  }

  componentDidMount() {
    let faded = document.querySelectorAll('.fade');

    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
      faded[i].classList.add('fade-in');
      }
    }
    setTimeout(Appear, 500);
}

  render() {
    return (
      <>
        <h1 className="Title">Settings<i className="fas fa-cog"></i></h1>
        <div className="fade settings">
          <div id="profileParent">
            <div id="profile">
              <i className="fas fa-user-circle"></i><h2>{this.props.firstName}</h2>
            </div>
            <button onClick={this.logout}>Log out</button>
          </div>
          <div id="table">
            <div className="row">
              <div>
                <p>Name</p>
                <h3>{this.props.firstName} {this.props.lastName}</h3>
              </div>
              <button onClick={this.toggleModal} id="name">Change</button>
            </div>
            <div className="row">
              <div>
                <p>Email</p>
                <h3>{this.props.email}</h3>
              </div>
              <button onClick={this.toggleModal} id="email">Change</button>
            </div>
          </div>
          <div className="buttonParent">
            <button onClick={this.toggleConfirmationModal}>Delete Account</button>
          </div>

        </div>
        {
          this.state.showModal ?
            <EditProfileModal
              closeModal={this.toggleModal}
              property={this.state.property}
              email={this.props.email}
              firstName={this.props.firstName}
              lastName={this.props.lastName}
            />
          : null
        }
        {
          this.state.showConfirmation ?
            <ConfirmationModal
              text={'Are you sure you want to delete your account? This action cannot be undone.'}
              confirmAction={this.deleteAccount}
              closeModal={this.toggleConfirmationModal}
              options={['Yes', 'No']}
              />
            : null
        }
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    firstName: state.user.firstName,
    lastName: state.user.lastName,
    email: state.user.email,
    id: state.user.id
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout())
  }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings));
