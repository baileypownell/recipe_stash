import React, { FormEvent } from 'react'
import './Signup.scss'
import ClipLoader from 'react-spinners/ClipLoader'
import AuthenticationService from '../../services/auth-service'
import UserService, { UserInputInterface, UserCreatedResponse } from '../../services/user-service'
import { isPasswordInvalid } from '../../models/functions'
import Fade from 'react-reveal/Fade'
import { Button, Snackbar, TextField } from '@material-ui/core'

type Props = {
  history: any
}

type State = {
    firstName: string
    lastName: string
    password: string
    confirmPassword: string
    email: string
    confirmPasswordMessage: boolean
    insufficientPasswordMessage: boolean
    formValid: boolean
    loading: boolean
    submissionError: string
    error: boolean,
    snackBarOpen: boolean,
    snackBarMessage: string
}

class Signup extends React.Component<Props, State> {
  state = {
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    email: '',
    confirmPasswordMessage: false,
    insufficientPasswordMessage: false,
    formValid: false,
    loading: false,
    submissionError: '',
    error: false,
    snackBarOpen: false,
    snackBarMessage: ''
  }

  componentDidMount () { }

  signup = async (e: FormEvent) => {
    e.preventDefault()
    const { email, password, firstName, lastName } = this.state
    this.setState({
      loading: true
    })
    try {
      const userInput: UserInputInterface = {
        firstName,
        lastName,
        password,
        email
      }
      const user: UserCreatedResponse = await UserService.createUser(userInput)
      if (user.success) {
        this.openSnackBar('Success! Logging you in now...')
        AuthenticationService.setUserLoggedIn()
        setTimeout(() => this.props.history.push('/recipes'), 2000)
      } else {
        this.setState({
          error: true,
          loading: false
        })
        this.openSnackBar(user.message)
      }
    } catch (err) {
      this.setState({
        loading: false
      })
      this.openSnackBar(err.response.data.error)
    }
  }

  checkFormValidation = () => {
    const { firstName, lastName, password, email, confirmPassword } = this.state
    if (firstName && lastName && password && email && confirmPassword) {
      if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || confirmPassword.length === 0) {
        this.setState({
          formValid: false
        })
      } else {
        this.setState({
          formValid: true
        })
      }
    }
  }

  updateInput = (e: any) => {
    this.setState({
      [e.target.id]: e.target.value
    } as any, () => this.checkFormValidation()
    )
    // remove email error if it exists
    if (e.target.id === 'email' && this.state.submissionError === 'An account already exists for this email.') {
      this.setState({
        submissionError: ''
      })
    }
  }

  validatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password: string = e.target.value
    if (isPasswordInvalid(password)) {
      this.setState({
        insufficientPasswordMessage: true,
        formValid: false
      })
    } else {
      this.setState({
        insufficientPasswordMessage: false,
        password: e.target.value
      })
      // then check if it doesn't match confirmPassword, but only if confirmPassword has already been set
      if (e.target.value !== this.state.confirmPassword && this.state.confirmPassword !== null) {
        this.setState({
          confirmPasswordMessage: true,
          formValid: false
        })
      } else if (e.target.value === this.state.confirmPassword) {
        () => this.checkFormValidation()
      }
    }
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

  confirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === this.state.password) {
      this.setState({
        confirmPassword: e.target.value,
        confirmPasswordMessage: false
      }, () => this.checkFormValidation())
    } else {
      this.setState({
        confirmPasswordMessage: true,
        formValid: false
      }, () => this.checkFormValidation())
    }
  }

  login = () => {
    this.props.history.push('/login')
  }

  render () {
    const { confirmPasswordMessage, insufficientPasswordMessage, loading, formValid, snackBarOpen, snackBarMessage } = this.state
    return (
        <div className="auth">
          <div className="gradient">
            <Fade top>
              <form onSubmit={this.signup}>
                <h1>Signup</h1>
                <TextField onChange={this.updateInput} id="firstName" type="text" name="firstname" label="First Name" />
                <TextField onChange={this.updateInput} id="lastName" type="text" name="lastname" label="Last Name" />
                <TextField onChange={this.updateInput} id="email" type="email" name="email" label="Email" />
                <TextField onChange={this.validatePassword} id="password" type="password" name="password" label="Password" />
                  {
                    insufficientPasswordMessage
                      ? <p className="error">Passwords must be at least 8 characters long and have at least 
                      one uppercase and one lower case character.</p>
                      : null}
                <TextField onChange={this.confirmPassword} id="confirmPassword" type="password" name="confirmpassword" label="Confirm Password" />
                  {confirmPasswordMessage ? <p className="error">Passwords must match</p> : null}
                <p>Already have an account? <span className="link" onClick={this.login}>Log in.</span></p>
                <Button variant="contained" color="secondary" disabled={!formValid} type="submit">
                  {loading
                    ? <ClipLoader
                        css={'border-color: white;'}
                        size={30}
                        color={'white'}
                        loading={this.state.loading}
                      />
                    : 'Submit'}
                </Button>
              </form>
            </Fade>
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
        </div>
    )
  }
}

export default Signup
