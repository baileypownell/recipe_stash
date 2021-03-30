import React from 'react'
import { withRouter } from "react-router-dom"
import ClipLoader from "react-spinners/ClipLoader"
import M from 'materialize-css'
import './ResetPassword.scss'
import AuthenticationService from '../../services/auth-service'

class ResetPassword extends React.Component {

  state = {
    invalidLink: false,
    password: '',
    passwordInvalid: true,
    loading: false
  }

  async componentDidMount() {
    // verify token matches AND hasn't expired
    let token = this.props.match.params.token;
    try {
      let res = await AuthenticationService.verifyEmailResetToken(token)
      if (!res.data.success) {
        this.setState({
          invalidLink: true
        })
      } else {
        this.setState({
          invalidLink: false,
          email: res.data.user_email
        })
      }
    } catch(err) {
      this.setState({
        invalidLink: true
      })
      console.log(err)
    }
  }

  goHome = () => {
    this.props.history.push('/')
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

  updatePassword = async(e) => {
    e.preventDefault();
    this.setState({
      loading: true
    })
    try {
      // TO-DO: consolidate all of this into one function!
      let reset_password_token = this.props.match.params.token
      await AuthenticationService.updatePassword(this.state.password, reset_password_token)
      M.toast({html: 'Password updated!'})
      this.setState({
        loading: false
      })
      // log the user in here
      try {
        // the same bug that happens occasionally when logging in can happen here
        let res = await AuthenticationService.signIn(this.state.password, this.state.email)
        if (res.data.success) {
          AuthenticationService.setUserLoggedIn()
          this.props.history.push(`/dashboard`)
        }
      } catch(err) {
        console.log(err)
      }
    } catch(err) {
      M.toast({html: 'There was an error.'})
      this.setState({
        loading: false
      })
    } 
  }

  render() {
    if (this.state.invalidLink) {
      return (
        <>
            <div className="invalid-link">
              <h3>The link is invalid or expired.</h3>
              <button className="waves-effect waves-light btn" onClick={this.goHome}>Home</button>
            </div>
        </>
      )
    } else {
      return (
        <>
          <div className="resetPassword">
            <h4>New Password</h4>
            <form onSubmit={this.updatePassword}>
            <input type="password" onChange={this.updatePasswordState} value={this.state.password}></input>
            {this.state.passwordInvalid && this.state.password.lengh > 0 ? <p className="error">Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.</p> : null}
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
        </>
      )
    }
  }
}


export default withRouter(ResetPassword);
