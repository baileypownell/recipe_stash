import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
const axios = require('axios');

import './ResetPassword.scss';

class ResetPassword extends React.Component {

  state = {
    invalidLink: false,
    password: '',
    passwordInvalid: true
  }

  componentDidMount() {
    // verify token matches AND hasn't expired
    console.log(this.props.location.pathname.split('/')[2]);
    let token = this.props.location.pathname.split('/')[2];
    axios.get(`${process.env.API_URL}/resetPassword/${this.props.id}/${token}`)
    .then((res) => {
      console.log(res);
      if (res.data.message === 'the link is invalid or expired') {
        this.setState({
          invalidLink: true
        })
      }
    })
    .catch()
  }

  goHome = () => {
    this.props.history.push('/home')
  }

  updatePasswordState = (e) => {
    // password must be at least 8 digits long, with at least one uppercase, one lowercase, and one digit
    // (?=.*\d)(?=.*[a-z])(?=.*[A-Z])
    if (e.target.value.length < 8 || !(/([A-Z]+)/g.test(e.target.value)) || !(/([a-z]+)/g.test(e.target.value)) || !(/([0-9]+)/g.test(e.target.value)) ) {
      this.setState({
          passwordInvalid: true,
          password: e.target.value
      })
    } else {
      this.setState({
          passwordInvalid: false,
          password: e.target.value
      });
  }
}

  updatePassword = () => {

  }

  render() {
    if (this.state.invalidLink) {
      return (
        <div className="invalidLink">
          <h3>The link is invalid or expired.</h3>
          <button onClick={this.goHome}>Home</button>
        </div>
      )
    } else {
      return (
        <div className="resetPassword">
          <h2>New Password</h2>
          <form onSubmit={this.updatePassword}>
          <input type="password" onChange={this.updatePasswordState} value={this.state.password}></input>
          {this.state.passwordInvalid && this.state.password !== '' ? <p className="error">Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.</p> : null}
          <button className={this.state.passwordInvalid ? 'disabled' : 'enabled'}>Submit</button>
          </form>
        </div>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    id: state.user.id
  }
}


export default withRouter(connect(mapStateToProps)(ResetPassword));
