import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import GoogleLogin from 'react-google-login';
import './Login.scss';

class Login extends React.Component {

  state = {
    email: null,
    password: null,
    formValid: false,
    loading: false,
    signInError: ''
  }

  componentDidMount() {
    let faded = document.querySelectorAll('.fade');

    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
      faded[i].classList.add('fade-in');
      }
    }
    setTimeout(Appear, 500);
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

  // for google authenticated users
  // onSignIn = (googleUser) => {
  //   console.log(JSON.stringify(googleUser.getBasicProfile()));
  // }

  responseGoogle = (response) => {
    console.log(response);
    // get email so that if the email exists in the database, the user is automatically logged in
    // may or may not be a security concern
    let email = response.profileObj.email;
    console.log(email);
    axios.get(`/userByEmail/${email}`)
    .then(res => {
      if (res.data.rowCount === 0 ) {
        this.setState({
          signInError: 'An account does not exist for this email.',
          loading: false
        })
      } else {
        axios.post(`/signinWithGoogle`, {
          email: email
        })
        .then(res => {
          // update Redux
          this.props.login(res.data.id, res.data.email, res.data.first_name, res.data.last_name);
          // redirect to /dashboard
          this.props.history.push('/dashboard');
        })
        .catch(err => {
          console.log(err)
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  signin = (event) => {
    event.preventDefault();
    this.setState({
      loading: true
    })
    // ensure user exists
    axios.get(`/userByEmail/${this.state.email}`)
    .then(res => {
      if (res.data.rowCount == 0) {
        this.setState({
          signInError: 'An account does not exist for this email.',
          loading: false
        })
      } else {
        axios.post(`/signin`, {
          password: this.state.password,
          email: this.state.email
        })
        .then(res => {
          if (res.data.success === false) {
            this.setState({
              signInError: 'The password you entered is incorrect.',
              loading: false
            })
          } else {
            // update Redux
            this.props.login(res.data.id, res.data.email, res.data.first_name, res.data.last_name);
            // redirect to /dashboard
            this.props.history.push('/dashboard');
          }
        })
        .catch((err) => {
          console.log(err)
        })
      }
    })
  }

  render() {
    const { formValid, loading, signInError } = this.state;
    return (
      <div className="auth">
        <form className="fade" onSubmit={this.signin}>
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
            disabled={!formValid}
            className={formValid ? 'enabled' : 'disabled'}>
            {loading?
              <ClipLoader
                css={`border-color: white;`}
                size={30}
                color={"#689943"}
                loading={loading}
              />
          : 'Submit'}
          </button>
          <p>Or, log in with Google</p>
            <GoogleLogin
               className="googleButton"
               clientId="448227348202-97da7vci3t474ch3ah6goms41nlghb1l.apps.googleusercontent.com"
               buttonText="Login with Google"
               onSuccess={this.responseGoogle}
               onFailure={this.responseGoogle}
               cookiePolicy={'single_host_origin'}
             />
          {signInError.length > 0 ? <p className="error">{signInError}</p> : null}
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
    login: (id, email, firstName, lastName) => dispatch(actions.login(id, email, firstName, lastName))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
