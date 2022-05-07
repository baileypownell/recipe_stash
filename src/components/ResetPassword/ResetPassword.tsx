import React, { FormEvent } from 'react'
import { withRouter } from 'react-router-dom'
import ClipLoader from 'react-spinners/ClipLoader'
import './ResetPassword.scss'
import AuthenticationService from '../../services/auth-service'
import { isPasswordInvalid } from '../../models/functions'
import { Snackbar, Button } from '@material-ui/core'

class ResetPassword extends React.Component<any, any> {
  state = {
    invalidLink: false,
    password: '',
    passwordInvalid: true,
    loading: false,
    email: '',
    snackBarOpen: false,
    snackBarMessage: ''
  }

  async componentDidMount () {
    const token = this.props.match.params.token
    try {
      const res = await AuthenticationService.verifyEmailResetToken(token)
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
    } catch (err) {
      this.setState({
        invalidLink: true
      })
      console.log(err)
    }
  }

  goHome = () => {
    this.props.history.push('/')
  }

  openSnackBar (message: string) {
    this.setState({
      snackBarOpen: true,
      snackBarMessage: message
    })
  }

  closeSnackBar = () => {
    this.setState({
      snackBarOpen: false,
      snackBarMessage: ''
    })
  }

  updatePasswordState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password: string = e.target.value
    if (isPasswordInvalid(password)) {
      this.setState({
        passwordInvalid: true,
        password: e.target.value
      })
    } else {
      this.setState({
        passwordInvalid: false,
        password: e.target.value
      })
    }
  }

  updatePassword = async (e: FormEvent) => {
    e.preventDefault()
    this.setState({
      loading: true
    })
    try {
      const reset_password_token = this.props.match.params.token
      await AuthenticationService.updatePassword(this.state.password, reset_password_token, this.state.email)
      this.openSnackBar('Password updated! Redirecting...')
      this.setState({
        loading: false
      })
      setTimeout(() => this.props.history.push('/recipes'), 3000)
    } catch (err) {
      this.openSnackBar('There was an error.')
      this.setState({
        loading: false
      })
    }
  }

  render () {
    const { snackBarMessage, snackBarOpen } = this.state
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
              {
                this.state.passwordInvalid && this.state.password.length
                  ? <p className="error">
                    Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.
                  </p>
                  : null
              }
              <Button
                disabled={this.state.passwordInvalid}
                variant="contained"
                color="secondary"
                type="submit">
                {this.state.loading
                  ? <ClipLoader
                    css={'border-color: white;'}
                    size={30}
                    color={'#689943'}
                    loading={this.state.loading}
                  />
                  : 'Submit'}
              </Button>
            </form>
          </div>

          <Snackbar
            open={snackBarOpen}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            onClose={this.closeSnackBar}
            autoHideDuration={4000}
            message={snackBarMessage}
            key={'bottom' + 'center'}
          />
        </>
      )
    }
  }
}

export default withRouter(ResetPassword)
