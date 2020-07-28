import React from 'react';
import { withRouter } from 'react-router-dom';
import './Signup.scss';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
const axios = require('axios');
const bcrypt = require('bcryptjs');
import ClipLoader from "react-spinners/ClipLoader";

class Signup extends React.Component {

  state = {
    firstName: null,
    lastName: null,
    password: null,
    confirmPassword: null,
    email: null,
    confirmPasswordMessage: false,
    insufficientPasswordMessage: false,
    formValid: false,
    loading: false,
    submissionError: '',
    error: false
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

  signup = (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = this.state;
    this.setState({
      loading: true
    })
    // make sure user doesn't already exist in the DB
    axios.get(`/users/${email}`)
    .then(res => {
      console.log(res)
      if (res.data.rowCount > 0) {
        this.setState({
          submissionError: 'An account already exists for this email.',
          loading: false
        })
        return;
      } else {
        // hash password before sending
        let hashedPassword = bcrypt.hashSync(password, 10);
        axios.post(`/users`, {
          firstName: firstName,
          lastName: lastName,
          password: hashedPassword,
          email: email
        })
        .then(res => {
          if (res.data) {
            // update Redux
            let id=res.data.id;
            this.props.login(id, email, firstName, lastName)
            // redirect to /dashboard
            this.props.history.push('/dashboard')
          } else {
            this.setState({
              error: true
            })
          }
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loading: false
          })
        })
      }
    })
    .catch(err => console.log(err))
  }

  checkFormValidation = () => {
    const { firstName, lastName, password, email, confirmPassword } = this.state;
    if ( firstName, lastName, password, email, confirmPassword) {
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

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkFormValidation()
    );
    // remove email error if it exists
    if (e.target.id === 'email' && this.state.submissionError === 'An account already exists for this email.') {
      this.setState({
        submissionError: ''
      })
    }
  }

  validatePassword = (e) => {
    // password must be at least 8 digits long, with at least one uppercase, one lowercase, and one digit
    // (?=.*\d)(?=.*[a-z])(?=.*[A-Z])
    if (e.target.value.length < 8 || !(/([A-Z]+)/g.test(e.target.value)) || !(/([a-z]+)/g.test(e.target.value)) || !(/([0-9]+)/g.test(e.target.value)) ) {

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

  confirmPassword = (e) => {
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
    const { confirmPasswordMessage, insufficientPasswordMessage, loading, formValid, submissionError } = this.state;
    return (
      <div className="auth">

        <form className="fade" onSubmit={this.signup}>
          <h1>Signup</h1>
          <label>
            First Name
            <input onChange={this.updateInput} id="firstName" type="text" name="firstname" />
          </label>
          <label>
            Last Name
            <input onChange={this.updateInput} id="lastName" type="text" name="lastname" />
          </label>
          <label>
            Email
            <input onChange={this.updateInput} id="email" type="email" name="email" />
          </label>
          <label>
            Password
            <input onChange={this.validatePassword} id="password" type="password" name="password" />
            {insufficientPasswordMessage ? <p className="error">Passwords must be at least 8 characters long and have at least one uppercase and one lower case character.</p> : null}
          </label>
          <label>
            Confirm Password
            <input onChange={this.confirmPassword} id="confirmPassword" type="password" name="confirmpassword" />
            {confirmPasswordMessage ? <p className="error">Passwords must match</p> : null}
          </label>
          <p>Already have an account? <span className="link" onClick={this.login}>Log in.</span></p>
          <button
            disabled={!formValid}
            className={formValid ? 'enabled' : 'disabled'}>
            {loading?
              <ClipLoader
                css={`border-color: white;`}
                size={30}
                color={"white"}
                loading={this.state.loading}
              />
          : 'Submit'}
          </button>
          {submissionError.length > 0 ?
            <p className="error">{this.state.submissionError}</p>
              : null
          }
          {this.state.error ?
            <p className="error">There has been an error.</p>
          : null}
        </form>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    login: (id, email, firstName, lastName) => dispatch(actions.login(id, email, firstName, lastName))
  }
}

export default connect(null, mapDispatchToProps)(Signup);
