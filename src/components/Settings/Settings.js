import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
import { withRouter } from "react-router-dom";

import EditProfileModal from './EditProfileModal/EditProfileModal';
import './Settings.scss';

class Settings extends React.Component {

  state = {
    showModal: false,
    property: null
  }

  logout = () => {
    this.props.logout();
    this.props.history.push('/home')
  }

  showModal = (e) => {
    this.setState({
      showModal: true,
      property: e.target.id
    })
  }

  closeModal = (e) => {
    this.setState({
      showModal: false
    })
  }

  render() {
    return (
      <>
        <h1 className="Title">Settings<i className="fas fa-cog"></i></h1>
        <div className="settings">
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
              <button onClick={this.showModal} id="name">Change</button>
            </div>
            <div className="row">
              <div>
                <p>Email</p>
                <h3>{this.props.email}</h3>
              </div>
              <button onClick={this.showModal} id="email">Change</button>
            </div>
          </div>
          <div className="buttonParent">
            <button>Delete Account</button>
          </div>

        </div>
        {
          this.state.showModal ?
            <EditProfileModal
              closeModal={this.closeModal}
              property={this.state.property}
              email={this.props.email}
              firstName={this.props.firstName}
              lastName={this.props.lastName}
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
    email: state.user.email
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout())
  }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings));
