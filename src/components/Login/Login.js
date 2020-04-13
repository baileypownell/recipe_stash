import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
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

  signin = (event) => {
    event.preventDefault();
    this.setState({
      loading: true
    })
    // ensure user exists
    axios.get(`${process.env.API_URL}/userByEmail/${this.state.email}`)
    .then(res => {
      if (res.data.rowCount == 0) {
        this.setState({
          signInError: 'An account does not exist for this email.',
          loading: false
        })
      } else {
        axios.post(`${process.env.API_URL}/signin`, {
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
