import React from 'react';

import './Signup.scss';

const axios = require('axios');
var bcrypt = require('bcryptjs');

class Signup extends React.Component {

  state = {
    firstName: null,
    lastName: null,
    password: null,
    confirmPassword: null,
    email: null,
    confirmPasswordMessage: false,
    formValid: false
  }

  hashPassword = () => {
    const password = this.state.password;
    const saltRounds = 10

    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        throw err
      } else {
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            throw err
          } else {
            return hash
          }
        })
      }
    })
  }

  signup = async (e) => {
    e.preventDefault();
    // hash passowrd before sending
    let hashedPassword = await this.hashPassword();
    console.log('hashed password', hashedPassword)

    axios.post('http://localhost:3000/signup', {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      password: hashedPassword,
      email: this.state.email
    })
    .then(res => {
      console.log(res);
      // redirect to /dashboard
    })
    .catch((err) => {
      console.log(err)
    })
  }

  updateInput = (e) => {

    this.setState({
      [e.target.id]: e.target.value
    });

    if (e.target.id === 'confirmPassword' && e.target.value !== this.state.password) {
      this.setState({
        confirmPasswordMessage: true
      });
      return;
    } else if (e.target.id === 'confirmPassword' && e.target.value === this.state.password) {
      this.setState({
        confirmPasswordMessage: false
      })
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
            <input onChange={this.updateInput} id="password" type="password" name="password" />
          </label>
          <label>
            Confirm Password
            <input onChange={this.updateInput} id="confirmPassword" type="password" name="confirmpassword" />
            {this.state.confirmPasswordMessage ? 'Passwords must match.' : null}
          </label>
          <button  className={this.state.formValid ? null : 'disabled'}>Submit</button>
        </form>
      </div>
    )
  }
}

export default Signup;
