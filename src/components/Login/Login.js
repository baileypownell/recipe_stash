import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import './Login.scss';

class Login extends React.Component {

  state = {
    email: null,
    password: null,
    formValid: false,
    loading: false,
    signInError: ''
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => {
      if (this.state.email !== null && this.state.password !== null) {
        this.setState({
          formValid: true
        })
      } else {
        this.setState({
          formValid: false
        })
      }
    });
  }

  signin = (event) => {
    event.preventDefault();
    this.setState({
      loading: true
    })
    // ensure user exists
    axios.get(`${process.env.API_URL}/userByEmail/${this.state.email}`)
    .then(res => {
      if (res.data.rowCount == 0) {
        this.setState({
          signInError: 'An account does not exist for this email.',
          loading: false
        })
      } else {
        axios.post(`${process.env.API_URL}/signin`, {
          password: this.state.password,
          email: this.state.email
        })
        .then(res => {
          if (res) {
            console.log(res)
            // update Redux
            this.props.login(res.data.id, res.data.first_name, res.data.last_name, res.data.email);
            // redirect to /dashboard
            this.props.history.push('/dashboard')
          } else {
            this.setState({
              signInError: 'The password you entered is incorrect.',
              loading: false
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
      }
    })
  }

  render() {
    return (
      <div className="auth">
        <form onSubmit={this.signin}>
          <h1>Login</h1>
          <label>
            Email
            <input onChange={this.updateInput} id="email" type="email" name="email" />
          </label>
          <label>
            Password
            <input onChange={this.updateInput} id="password" type="password" name="password" />
          </label>
          <button
            disabled={!this.state.formValid}
            className={this.state.formValid ? 'enabled' : 'disabled'}>
            {this.state.loading?
              <ClipLoader
                css={`border-color: #689943;`}
                size={30}
                color={"#689943"}
                loading={this.state.loading}
              />
          : 'Submit'}
          </button>
          {this.state.signInError.length > 0 ? <p className="error">{this.state.signInError}</p> : null}
        </form>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    userLoggedIn: state.userLoggedIn
  }
}

const mapDispatchToProps = dispatch => {
  return {
    login: (id, firstName, lastName, email) => dispatch(actions.login(id, firstName, lastName, email))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
