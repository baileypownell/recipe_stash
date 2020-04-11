import React from 'react';

import axios from 'axios';

class ResetPassword extends React.Component {
  state = {
    email: '',
    showError: false,
    messageFromServer: '',
  }

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  sendEmail = () => {
    e.preventDefault();
    axios.post(`${process.env.API_URL}/resetEmail/`, {
      email: this.state.email
    })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => console.log(err))
  }

  render() {
    const { email, messageFromServer, showError } = this.state;
    return (
      <form onSubmit={this.sendEmail} >
        <input
          type="email" id="email"
          value={email}
          onChange={this.handleChange}
          placeholder={'Email address'}
        </input>
        <button>Send Password Reset Email</button>
      </form>
    )
  }
}

export default ResetPassword;
