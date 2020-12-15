import React from 'react';
import { connect } from 'react-redux';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import * as actions from '../../store/actionCreators';
import GoogleLogin from 'react-google-login';
import './Login.scss';
import M from 'materialize-css'


class Login extends React.Component {

  state = {
    email: null,
    password: null,
    formValid: false,
    loading: false,
    signInError: false
  }

  componentDidMount() {
    let faded = document.querySelectorAll('.fade')
    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
        faded[i].classList.add('fade-in')
      }
    }
    setTimeout(Appear, 500)
    M.updateTextFields()
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

  sendPasswordResetLink = (e) => {
    e.preventDefault()
    axios.post(`/sendResetEmail`, {
      email: this.state.email
    })
    .then(res => {
      res.data.success ? M.toast({html: 'Check your email for a link to reset your password.'}) : M.toast({html: 'There was an error.'}) 
    })
    .catch(err => {
      M.toast({html: 'There was an error.'})
    })
  }

  responseGoogle = (response) => {
    axios.post(`/signinWithGoogle`, {
        token: response.tokenId, 
    })
    .then((res) => {
      if (res.data.success) {
        this.props.login()
        this.props.history.push('/dashboard')
      } else {
        M.toast({ html: res.data.message })
        this.setState({
          signInError: true
        })
      }
    })
    .catch(err => {
      console.log(err)
      M.toast({html: err.data ? err.data.message : 'Could not authenticate.'})
      this.setState({
        signInError: true
      })
    })
  }
    


  signin = (event) => {
    event.preventDefault();
    this.setState({
      loading: true
    })
    axios.post(`/signin`, {
        password: this.state.password,
        email: this.state.email
    })
    .then(res => {
      if (res.data.success) {
        this.props.login();
        this.props.history.push(`/dashboard`);
      } else {
        this.setState({
          loading: false,
          signInError: true
        })
        M.toast({html: res.data.message})
      }
    })
    .catch((err) => {
      M.toast({html: err.response.data.error || 'There was an error.'})
      this.setState({
        signInError: true,
        loading: false
      })
    })
  }
  

  render() {
    const { formValid, loading, signInError } = this.state;
    return (
      <div className="auth">
        <div className="gradient">
          <form className="fade" onSubmit={this.signin}>
            <h1>Login</h1>
            <div className="input-field">
              <input 
                className="materialize-input" 
                id="email" 
                onChange={this.updateInput}
                type="email" 
                name="email" 
                />
              <label className="active" htmlFor="email">Email</label>
            </div>
            <div className="input-field">
              <input 
                onChange={this.updateInput} 
                id="password" 
                type="password" 
                name="password" 
              />
            <label className="active" htmlFor="password">
              Password
            </label>
            </div>

            <div className="buttons">
            <button
              disabled={!formValid}
              className={formValid ? 'enabled' : 'disabled'}
              className="waves-effect waves-light btn"
              >
              {loading?
                <ClipLoader
                  css={`border-color: white;`}
                  size={30}
                  color={"#689943"}
                  loading={loading}
                />
            : 'Submit'}
            </button>
            
              <GoogleLogin
                className="googleButton"
                clientId={process.env.GOOGLE_LOGIN_CLIENT_ID}
                buttonText="Login with Google"
                onSuccess={this.responseGoogle}
                onFailure={this.responseGoogle}
                cookiePolicy={'single_host_origin'}
              />

            {signInError ? 
                  <button className="waves-effect waves-light btn" onClick={this.sendPasswordResetLink}>Reset Password</button>
            : null}
            </div>
          </form>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    login: () => dispatch(actions.login())
  }
}

export default connect(null, mapDispatchToProps)(Login);
