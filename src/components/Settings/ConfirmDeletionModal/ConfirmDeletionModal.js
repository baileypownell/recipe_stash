import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import axios from 'axios';
import * as actions from '../../../store/actionCreators';
import './ConfirmDeletionModal.scss';

class ConfirmDeletionModal extends React.Component {

  state = {
    password: '',
    loading: false,
    authenticationError: false
  }

  updatePassword = (e) => {
    this.setState({
      password: e.target.value
    })
  }

  deleteAccount = (e) => {
    e.preventDefault();
    // first validate that their email is correct...
    axios.post(`${process.env.API_URL}/signin`, {
      password: this.state.password,
      email: this.props.email
    })
    .then(res => {
      console.log(res)
      if (res.data.success === false) {
        this.setState({
          authenticationError: 'The password you entered is incorrect.',
          loading: false
        })
      } else {
        axios.delete(`${process.env.API_URL}/deleteAccount/${this.props.id}`)
        .then((res) => {
          axios.delete(`${process.env.API_URL}/deleteAllUserRecipes/${this.props.id}`)
          .then(res => {
            console.log(res)
            // update redux
            this.props.logout();
            this.props.history.push('/home');
          })
        })
        .catch(err => console.log(err))
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }

  render() {
    return (
      <div className="modal">
        <i
          onClick={this.props.closeModal}
          className="fas fa-times-circle">
        </i>
        <form className="deleteAccount">
          <h3>If you are sure you want to delete your account, enter your password below. (This action cannot be undone).</h3>
          <input type="password" onChange={this.updatePassword} value={this.state.value}></input>
          <button onClick={this.deleteAccount}>Delete Account</button>
          {
            this.state.authenticationError ? <p>{this.state.authenticationError}</p>
            : null
          }
        </form>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    id: state.user.id,
    email: state.user.email
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout())
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConfirmDeletionModal));
