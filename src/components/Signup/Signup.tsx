import React, { FormEvent } from 'react'
import './Signup.scss'
import ClipLoader from "react-spinners/ClipLoader"
import AuthenticationService from '../../services/auth-service'
import UserService, { UserInputInterface, UserCreatedResponse } from '../../services/user-service'
import { isPasswordInvalid } from '../../models/functions'
import Fade from 'react-reveal/Fade'

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
    error: boolean
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
  }


  componentDidMount() { }

  signup = async(e: FormEvent) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = this.state;
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
        M.toast({html: 'Success! Logging you in now...'})
        AuthenticationService.setUserLoggedIn()
        this.props.history.push('/recipes')
      } else {
        this.setState({
          error: true,
          loading: false
        })
        M.toast({html: user.message})
      }
    } catch(err) {
      this.setState({
        loading: false
      })
      M.toast({html: err.response.data.error})
    }
  }

  checkFormValidation = () => {
    const { firstName, lastName, password, email, confirmPassword } = this.state;
    if ( firstName && lastName && password && email && confirmPassword) {
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
    );
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
      });
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

  render() {
    const { confirmPasswordMessage, insufficientPasswordMessage, loading, formValid } = this.state;
    return (
        <div className="auth">
          <div className="gradient">
            <Fade top>
              <form onSubmit={this.signup}>
                <h1>Signup</h1>
                <div className="input-field">
                  <input onChange={this.updateInput} id="firstName" type="text" name="firstname" />
                  <label htmlFor="firstName" >
                    First Name
                  </label>
                </div>
                <div className="input-field">
                  <input onChange={this.updateInput} id="lastName" type="text" name="lastname" />
                <label htmlFor="lastName" >Last Name</label>
                </div>
                <div className="input-field">
                    <input onChange={this.updateInput} id="email" type="email" name="email" />
                  <label htmlFor="email" >Email</label>
                </div>
                <div className="input-field">
                  <input onChange={this.validatePassword} id="password" type="password" name="password"  />
                  <label htmlFor="password" >Password</label>
                  {
                    insufficientPasswordMessage ?
                      <p className="error">Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.</p>
                  : null}
                </div>
                <div className="input-field">
                  <input onChange={this.confirmPassword} id="confirmPassword" type="password" name="confirmpassword" />
                  {confirmPasswordMessage ? <p className="error">Passwords must match</p> : null}
                <label htmlFor="confirmPassword">Confirm Password</label>
                </div>
                <p>Already have an account? <span className="link" onClick={this.login}>Log in.</span></p>
                <button
                  disabled={!formValid}
                  className={formValid ? 'enabled waves-effect waves-light btn' : 'disabled waves-effect waves-light btn'}>
                  {loading?
                    <ClipLoader
                      css={`border-color: white;`}
                      size={30}
                      color={"white"}
                      loading={this.state.loading}
                    />
                : 'Submit'}
                </button>
              </form>
            </Fade>
          </div>
        </div>
    )
  }
}

export default Signup;
