import React from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import GoogleLogin from 'react-google-login'
import './Login.scss'
import M from 'materialize-css'
import AuthenticationService from '../../services/auth-service'
import Fade from 'react-reveal/Fade'
import { Button, Snackbar } from '@material-ui/core'

class Login extends React.Component {
  state = {
    email: null,
    password: null,
    formValid: false,
    loading: false,
    signInError: false,
    snackBarOpen: false,
    snackBarMessage: ''
  }

  componentDidMount (): void {
    M.updateTextFields()
  }

  updateInput = (e: any): void => {
    this.setState({ [e.target.id]: e.target.value }, () => {
      if (this.state.email !== null && this.state.password !== null) {
        this.setState({
          formValid: true
        })
      } else {
        this.setState({
          formValid: false
        })
      }
    })
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

  sendPasswordResetLink = async (e): Promise<void> => {
    e.preventDefault()
    try {
      const res = await AuthenticationService.getPasswordResetLink(
        this.state.email
      )
      res.data.success
        ? this.openSnackBar('Check your email for a link to reset your password.')
        : this.openSnackBar('There was an error.')
    } catch (err) {
      console.log(err)
      this.openSnackBar('There was an error.')
    }
  }

  responseGoogle = async (response) => {
    try {
      const res = await AuthenticationService.signInWithGoogle(response.tokenId)
      if (res.data.success) {
        AuthenticationService.setUserLoggedIn()
        this.props.history.push('/recipes')
      } else {
        this.openSnackBar(res.data.message)
        this.setState({
          signInError: true
        })
      }
    } catch (err) {
      console.log(err)
      this.openSnackBar(err.data ? err.data.message : 'Could not authenticate.')
      this.setState({
        signInError: true
      })
    }
  }

  signin = async (event) => {
    event.preventDefault()
    this.setState({
      loading: true
    })
    try {
      const res = await AuthenticationService.signIn(
        this.state.password,
        this.state.email
      )
      if (res.data?.success) {
        AuthenticationService.setUserLoggedIn()
        this.props.history.push('/recipes')
      } else {
        this.setState({
          loading: false,
          signInError: true
        })
        this.openSnackBar(res.data.message)
      }
    } catch (err) {
      console.log(err)
      this.openSnackBar(err.response.data?.error || 'There was an error.')
      this.setState({
        signInError: true,
        loading: false
      })
    }
  }

  render () {
    const { formValid, loading, signInError, snackBarMessage, snackBarOpen } = this.state
    return (
      <>
        <div className="auth">
          <div className="gradient">
            <Fade top>
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
                  <label className="active" htmlFor="email">
                    Email
                  </label>
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
                  <Button
                    type="submit"
                    variant="outlined"
                    color="secondary"
                    disabled={!formValid}
                  >
                    {loading
                      ? (
                      <ClipLoader
                        css={`
                          border-color: white;
                        `}
                        size={30}
                        color={'#689943'}
                        loading={loading}
                      />
                        )
                      : (
                          'Submit'
                        )}
                  </Button>

                  <GoogleLogin
                    className="googleButton"
                    clientId={process.env.GOOGLE_LOGIN_CLIENT_ID}
                    buttonText="Login with Google"
                    onSuccess={this.responseGoogle}
                    onFailure={this.responseGoogle}
                    cookiePolicy={'single_host_origin'}
                  />

                  {signInError
                    ? (
                    <Button
                      variant="contained"
                      onClick={this.sendPasswordResetLink}
                      color="primary"
                    >
                      Reset Password
                    </Button>
                      )
                    : null}
                </div>
              </form>
            </Fade>
          </div>
        </div>

        <Snackbar
          open={snackBarOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          onClose={this.closeSnackBar}
          autoHideDuration={3000}
          message={snackBarMessage}
          key={'bottom' + 'center'}
        />
      </>
    )
  }
}
export default Login
