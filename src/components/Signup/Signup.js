import React from 'react';

import './Signup.scss';

class Signup extends React.Component {

  state = {
    firstName: null,
    lastName: null,
    password: null,
    email: null
  }

  signup = async () => {
    let response = await fetch('/signup', {
      body: JSON.stringify({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        password: this.state.password,
        email: this.state.email
      })
    })
    .then(res => console.log(res))
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  render() {
    return (
      <div className="auth">

        <form>
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
            <input onChange={this.updateInput} type="password" name="confirmpassword" />
          </label>
          <button onClick={this.signup}>Submit</button>
        </form>
      </div>
    )
  }
}

export default Signup;
