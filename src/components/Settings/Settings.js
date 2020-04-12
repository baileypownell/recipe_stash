import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
import { withRouter } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios';
import EditProfileModal from './EditProfileModal/EditProfileModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ConfirmDeletionModal from './ConfirmDeletionModal/ConfirmDeletionModal';
import './Settings.scss';

class Settings extends React.Component {

  state = {
    showModal: false,
    showConfirmation: false,
    showPasswordMessage: false,
    loading: false,
    emailLoading: false
  }

  logout = () => {
    this.props.logout();
    this.props.history.push('/home')
  }

  showModal = (e) => {
    this.setState({
      showModal: true
    })
  }

  closeModal = (e) => {
    this.setState({
      showModal: false
    })
  }


  toggleConfirmationModal = () => {
    this.setState(prevState => ({
      showConfirmation: !prevState.showConfirmation
    }))
  }

  resetPassword = () => {
    this.setState({
      loading: true
    })
    axios.post(`${process.env.API_URL}/resetPassword`, {
      email: this.props.email
    })
    .then(res => {
      console.log('the result is: ', res);
      this.setState({
        showPasswordMessage: true,
        loading: false
      })
    })
    .catch(err => {
      console.log(err);
      this.setState({
        loading: false
      })
    })
  }

  sendEmailUpdateLink = () => {
    this.setState({
      emailLoading: true
    })
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
              <button onClick={this.showModal} >Change</button>
            </div>
            <div className="row">
              <div>
                <p>Email</p>
                <h3>{this.props.email}</h3>
              </div>
              <button onClick={this.sendEmailUpdateLink} >
                {this.state.emailLoading ?
                  <ClipLoader
                    css={`border-color: white`}
                    size={30}
                    color={"white"}
                    loading={this.state.emailLoading}
                  /> :
                `Change`}
              </button>
            </div>
          </div>
          <div className="buttonParent">
            <button onClick={this.toggleConfirmationModal}>Delete Account</button>
            <button
              onClick={this.resetPassword}>
              {this.state.loading?
                <ClipLoader
                  css={`border-color: white;`}
                  size={30}
                  color={"white"}
                  loading={this.state.loading}
                />
              : 'Reset Password'}
            </button>
          </div>
          {this.state.showPasswordMessage ?
            <p class="passwordMessage">An email has been sent to your account with a link to reset your password.</p>
            : null
          }
        </div>
        {
          this.state.showModal ?
            <EditProfileModal
              closeModal={this.closeModal}
              firstName={this.props.firstName}
              lastName={this.props.lastName}
            />
          : null
        }
        {
          this.state.showConfirmation ?
            <ConfirmDeletionModal
              deleteAccount={this.deleteAccount}
              closeModal={this.toggleConfirmationModal}
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
