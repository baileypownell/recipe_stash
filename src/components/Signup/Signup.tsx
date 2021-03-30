import React, { FormEvent } from 'react'
import './Signup.scss'
import ClipLoader from "react-spinners/ClipLoader"
import AuthenticationService from '../../services/auth-service'
import UserService, { UserInputInterface } from '../../services/user-service'
import { isPasswordInvalid } from '../../models/functions'
import { appear } from '../../models/functions'

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


  componentDidMount() {
    let faded = document.querySelectorAll('.fade');
    setTimeout(appear(faded, 'fade-in'), 500);
  }

  signup = async(e: FormEvent) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = this.state;
    this.setState({
      loading: true
    })
    try {
      let userInput: UserInputInterface = {
        firstName,
        lastName,
        password,
        email
      }
      let res = await UserService.createUser(userInput)
      if (res.data.success) {
        M.toast({html: 'Success! Logging you in now...'})
        AuthenticationService.setUserLoggedIn()
        this.props.history.push('/dashboard')
      } else {
        this.setState({
          error: true, 
          loading: false
        })
        M.toast({html: res.data.message})
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
    // if (e.target.value.length < 8 || 
    //     !(/([A-Z]+)/g.test(e.target.value)) ||
    //     !(/([a-z]+)/g.test(e.target.value)) || 
    //     !(/([0-9]+)/g.test(e.target.value))
    //   ) {
    let password: string = e.target.value
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
            <form className="fade" onSubmit={this.signup}>
              <h1>Signup</h1>
              <div className="input-field">
                <input onChange={this.updateInput} id="firstName" type="text" name="firstname" />
                <label htmlFor="firstName" className="active">
                  First Name
                </label>
              </div>
              <div className="input-field">
                <input onChange={this.updateInput} id="lastName" type="text" name="lastname" />
              <label htmlFor="lastName" className="active">Last Name</label>
              </div>
              <div className="input-field">
                  <input onChange={this.updateInput} id="email" type="email" name="email" />
                <label htmlFor="email" className="active">Email</label>
              </div>
              <div className="input-field">
                <input onChange={this.validatePassword} id="password" type="password" name="password"  />
                <label htmlFor="password" className="active">Password</label>
                {
                  insufficientPasswordMessage ? 
                    <p className="error">Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.</p> 
                : null}
              </div>
              <div className="input-field">
                <input onChange={this.confirmPassword} id="confirmPassword" type="password" name="confirmpassword" />
                {confirmPasswordMessage ? <p className="error">Passwords must match</p> : null}
              <label htmlFor="confirmPassword" className="active">Confirm Password</label>
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
          </div>
        </div>
    )
  }
}

export default Signup;
