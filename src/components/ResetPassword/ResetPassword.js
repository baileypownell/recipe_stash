import React from 'react';
import { withRouter } from "react-router-dom";
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import M from 'materialize-css';
import './ResetPassword.scss';

class ResetPassword extends React.Component {

  state = {
    invalidLink: false,
    password: '',
    passwordInvalid: true,
    loading: false
  }

  componentDidMount() {
    // verify token matches AND hasn't expired
    let token = this.props.location.pathname.split('/')[2];
    axios.get(`/sendResetEmail/${this.props.id}/${token}`)
    .then((res) => {
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

  updatePassword = (e) => {
    e.preventDefault();
    this.setState({
      loading: true
    })
    axios.put(`/users`, {
      password: this.state.password,
      reset_password_token: this.props.location.pathname.split('/')[2]
    })
    .then(res => {
      this.setState({
        loading: false
      });
      M.toast({html: 'Password updated!'});
      this.props.history.push('/dashboard');
    })
    .catch((err) => {
      this.setState({
        loading: false
      })
      M.toast({html: 'There was an error.'})
    })
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
          <h4>New Password</h4>
          <form onSubmit={this.updatePassword}>
          <input type="password" onChange={this.updatePasswordState} value={this.state.password}></input>
          {this.state.passwordInvalid && this.state.password !== '' ? <p className="error">Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.</p> : null}
          <button
            disabled={this.state.passwordInvalid} 
            className="waves-effect waves-light btn"
            >
            {this.state.loading?
              <ClipLoader
                css={`border-color: white;`}
                size={30}
                color={"#689943"}
                loading={this.state.loading}
              />
          : 'Submit'}
          </button>
          </form>
        </div>
      )
    }
  }
}


export default withRouter(ResetPassword);
