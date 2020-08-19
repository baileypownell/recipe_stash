import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import GoogleLogin from 'react-google-login';
import './Login.scss';
import M from 'materialize-css';

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
    //console.log(process.env)
    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
        faded[i].classList.add('fade-in');
      }
    }
    setTimeout(Appear, 500);
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

  sendPasswordResetLink = () => {
    axios.post(`/sendResetEmail`, {
      email: this.state.email
    })
    .then(res => {
      if (res.data.success === false) {
        M.toast({html: 'There was an error.'})
      } else {
        M.toast({html: 'Check your email for a link to reset your password.'})
      }
    })
    .catch(err => {
      console.log(err);
      M.toast({html: 'Whoops! Password could not be reset.'})
    })
  }

  responseGoogle = (response) => {
    // get email so that if the email exists in the database, the user is automatically logged in
    // may or may not be a security concern
    let email = response.profileObj.email;
    axios.get(`/users/${email}`)
    .then(res => {
      if (res.data.rowCount === 0 ) {
        this.setState({
          signInError: 'An account does not exist for this email.',
          loading: false
        })
        M.toast({html: 'An account does not exist for this email.'})
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
    console.log(this.state)
    // ensure user exists
    axios.get(`/users/${this.state.email}`)
    .then(res => {
      if (res.data.rowCount == 0) {
        this.setState({
          signInError: 'An account does not exist for this email.',
          loading: false
        })
        M.toast({html: 'An account does not exist for this email.'})
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
            M.toast({html: 'The password you entered is incorrect.'})
          } else if (res.data) {
            // update Redux
            //this.props.login(res.data.id, res.data.email, res.data.first_name, res.data.last_name);
            // redirect to /dashboard
            this.props.history.push('/dashboard');
          }
        })
        .catch((err) => {
          console.log(err)
          M.toast({html: 'There was an error.'})
        })
      }
    })
    .catch((err) => {
      console.log(err)
      M.toast({html: 'There was an error.'})
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
               clientId="448227348202-97da7vci3t474ch3ah6goms41nlghb1l.apps.googleusercontent.com"
               buttonText="Login with Google"
               onSuccess={this.responseGoogle}
               onFailure={this.responseGoogle}
               cookiePolicy={'single_host_origin'}
             />

          {
              signInError.length > 0 ? 
                  <button className="waves-effect waves-light btn" onClick={this.sendPasswordResetLink}>Reset Password</button>
              : null
          }
          </div>
          
        </form>
      </div>
    )
  }
}

// const mapStateToProps = state => {
//   return {
//     userLoggedIn: state.userLoggedIn
//   }
// }

// const mapDispatchToProps = dispatch => {
//   return {
//     login: (id, email, firstName, lastName) => dispatch(actions.login(id, email, firstName, lastName))
//   }
// }

export default Login;
