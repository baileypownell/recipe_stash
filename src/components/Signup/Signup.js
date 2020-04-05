import React from 'react';
import { withRouter } from 'react-router-dom';
import './Signup.scss';

const axios = require('axios');
var bcrypt = require('bcryptjs');
import ClipLoader from "react-spinners/ClipLoader";

class Signup extends React.Component {

  state = {
    firstName: null,
    lastName: null,
    password: null,
    confirmPassword: null,
    email: null,
    confirmPasswordMessage: false,
    insufficientPasswordMessage: false,
    formValid: false,
    loading: false
  }

  signup = (e) => {
    e.preventDefault();
    this.setState({
      loading: true
    })
    // hash passowrd before sending
    let hashedPassword = bcrypt.hashSync(this.state.password, 10);

    axios.post(`${process.env.API_URL}/signup`, {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      password: hashedPassword,
      email: this.state.email
    })
    .then(res => {
      console.log(res);
      // redirect to /dashboard
      this.props.history.push('/dashboard')
    })
    .catch((err) => {
      console.log(err)
    })
  }

  checkFormValidation = () => {
    const { firstName, lastName, password, email, confirmPassword } = this.state;
    if ( firstName, lastName, password, email, confirmPassword) {
      if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || confirmPassword.length === 0) {
        this.setState({
          formValid: false
        })
      } else {
        this.setState({
          formValid: true
        })
      }
    }
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkFormValidation()
    );
  }

  validatePassword = (e) => {
    // password must be at least 8 digits long, with at least one uppercase, one lowercase, and one digit
    // (?=.*\d)(?=.*[a-z])(?=.*[A-Z])
    if (e.target.value.length < 8 || !(/([A-Z]+)/g.test(e.target.value)) || !(/([a-z]+)/g.test(e.target.value)) || !(/([0-9]+)/g.test(e.target.value)) ) {

      this.setState({
          insufficientPasswordMessage: true,
          formValid: false
      })

    } else {
      this.setState({
          insufficientPasswordMessage: false,
          password: e.target.value
      });
      // then check if it doesn't match confirmPassword, but only if confirmPassword has already been set
      if (e.target.value !== this.state.confirmPassword && this.state.confirmPassword !== null) {
        this.setState({
          confirmPasswordMessage: true,
          formValid: false
        })
      } else if (e.target.value === this.state.confirmPassword) {
        () => this.checkFormValidation()
      }
    }
  }

  confirmPassword = (e) => {
    if (e.target.value === this.state.password) {
      this.setState({
        confirmPassword: e.target.value,
        confirmPasswordMessage: false
      }, () => this.checkFormValidation())
    } else {
      this.setState({
        confirmPasswordMessage: true,
        formValid: false
      }, () => this.checkFormValidation())
    }
  }

  render() {
    return (
      <div className="auth">

        <form onSubmit={this.signup}>
          <h1>Signup</h1>
          <label>
            First Name
            <input onChange={this.updateInput} id="firstName" type="text" name="firstname" />
          </label>
          <label>
            Last Name
            <input onChange={this.updateInput} id="lastName" type="text" name="lastname" />
          </label>
          <label>
            Email
            <input onChange={this.updateInput} id="email" type="email" name="email" />
          </label>
          <label>
            Password
            <input onChange={this.validatePassword} id="password" type="password" name="password" />
            {this.state.insufficientPasswordMessage ? 'Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.' : null}
          </label>
          <label>
            Confirm Password
            <input onChange={this.confirmPassword} id="confirmPassword" type="password" name="confirmpassword" />
            {this.state.confirmPasswordMessage ? 'Passwords must match.' : null}
          </label>
          <button
            className={this.state.formValid ? 'enabled' : 'disabled'}>
            {this.state.loading?
              <ClipLoader
                css={`border-color: white;`}
                size={20}
                color={"white"}
                loading={this.state.loading}
              />
          : 'Submit'}
          </button>
        </form>
      </div>
    )
  }
}

export default Signup;
