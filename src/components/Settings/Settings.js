import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
import { withRouter } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios';
import EditProfileModal from './EditProfileModal/EditProfileModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ConfirmDeletionModal from './ConfirmDeletionModal/ConfirmDeletionModal';
import EditEmailModal from './EditEmailModal/EditEmailModal';
import './Settings.scss';

class Settings extends React.Component {

  state = {
    showModal: false,
    showConfirmation: false,
    showPasswordMessage: false,
    loading: false,
    emailLoading: false,
    showPasswordError: false,
    editEmail: false
  }

  logout = () => {
    this.props.logout();
    this.props.history.push('/home')
  }

  showModal = () => {
    this.setState({
      showModal: true
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  closeEmailModal = () => {
    this.setState({
      editEmail: false
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
    axios.post(`/sendResetEmail`, {
      email: this.props.email
    })
    .then(res => {
      if (res.data.success === false) {
        this.setState({
          showPasswordError: true,
          loading: false
        })
      } else {
        this.setState({
          showPasswordMessage: true,
          loading: false
        })
      }
    })
    .catch(err => {
      this.setState({
        loading: false
      })
    })
  }

  showEmailModal = () => {
    this.setState({
      editEmail: true
    });
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
            <button className="waves-effect waves-light btn" onClick={this.logout}>Log out</button>
          </div>
          <div id="table">
            <div className="row">
              <div>
                <p>Name</p>
                <h3>{this.props.firstName} {this.props.lastName}</h3>
              </div>
              <button className="waves-effect waves-light btn" onClick={this.showModal} >Change</button>
            </div>
            <div className="row">
              <div>
                <p>Email</p>
                <h3>{this.props.email}</h3>
              </div>
              <button className="waves-effect waves-light btn" onClick={this.showEmailModal} >
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
            <button className="waves-effect waves-light btn" onClick={this.toggleConfirmationModal}>Delete Account</button>
            <button
              className="waves-effect waves-light btn"
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
            <p className="passwordMessage">An email has been sent to your account with a link to reset your password.</p>
            : null
          }
          {
            this.state.showPasswordError ?
            <p className="passwordMessage">The email could not be sent.</p> : null
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
              closeModal={this.toggleConfirmationModal}
              />
            : null
        }
        {
          this.state.editEmail ?
          <EditEmailModal
            closeModal={this.closeEmailModal}
            id={this.props.id}
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
