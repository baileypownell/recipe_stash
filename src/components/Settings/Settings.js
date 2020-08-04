import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actionCreators';
import { withRouter } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios';
import M from 'materialize-css';
import './Settings.scss';

class Settings extends React.Component {

  state = {
    showModal: false,
    showConfirmation: false,
    showPasswordMessage: false,
    loading: false,
    emailLoading: false,
    showPasswordError: false,
    editEmail: false,
    password: ''
  }

  logout = () => {
    this.props.logout();
    this.props.history.push('/home')
  }

  resetPassword = () => {
    axios.post(`/sendResetEmail`, {
      email: this.props.email
    })
    .then(res => {
      if (res.data.success === false) {

      } else {

      }
    })
    .catch(err => {
      M.toast({html: 'Whoops! Password could not be reset.'})
    })
  }

  componentDidMount() {
    let faded = document.querySelectorAll('.fade');
    let Appear = () => {
      for (let i = 0; i <faded.length; i++) {
      faded[i].classList.add('fade-in');
      }
    }
    setTimeout(Appear, 500);

    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.collapsible');
      var instances = M.Collapsible.init(elems, {});
    });

    this.setState({
      firstName: this.props.firstName, 
      lastName: this.props.lastName,
      email: this.props.email
    })
}

updateInput = (e) => {
  this.setState({
    [e.target.id]: e.target.value
  })
}

updateProfile = (e) => {
  const { firstName, lastName } = this.state;
  const { id } = this.props;
  e.preventDefault();
  let payload = {
      first_name: firstName,
      last_name: lastName,
      id: id
  }
  axios.put(`/users`, payload)
  .then((res) => {
    M.toast({html: 'Profile updated successfully.'})
    this.updateView()
  })
  .catch(err => {console.log(err)})
}

updateEmail = (e) => {
  e.preventDefault();
  axios.put(`/users`, {
    new_email: this.state.email,
    password: this.state.password,
    id: this.props.id
  })
  .then(res => {
    console.log(res)
    if (res.data.success === false) {
      M.toast({html: 'Whoops, email could not be updated.'})
    } else if (res.data.success === true) {
      M.toast({html: 'Email updated successfully.'})
      this.updateView()
    }
  })
  .catch(err => {
    console.log(err);
    M.toast({html: 'There was an error.'})
  })
}

deleteAccount = (e) => {
  e.preventDefault();
  // first validate that their email is correct...
  axios.post(`/signin`, {
    password: this.state.password,
    email: this.props.email
  })
  .then(res => {
    if (res.data.success === false) {
      M.toast({html: 'The password you entered is incorrect.'})
    } else {
      axios.delete(`/users/${this.props.id}`)
      .then((res) => {
        axios.delete(`/recipes/all/${this.props.id}`)
        .then(res => {
          M.toast({html: 'Account deleted.'})
          // update redux
          this.props.logout();
          this.props.history.push('/home');
        })
      })
      .catch(err => console.log(err))
    }
  })
  .catch((err) => {
    console.log(err)
    M.toast({html: 'There was an error.'})
  })
}

updatePassword = (e) => {
  e.preventDefault();
  console.log(this.props.email)
  axios.post('/sendResetEmail', {
    email: this.props.email
  })
  .then(() => {
    M.toast({html: 'Password email sent.'})
  })
  .catch((err) => {
    console.log(err)
    M.toast({html: 'There was an error.'})
  })
}


  handleUpdateEmail = (e) => {
    this.setState({
      new_email: e.target.value
    })
  }

  handleUpdatePassword = (e) => {
    this.setState({
      password: e.target.value
    })
  }

  handleUpdateFirstName = (e) => {
    this.setState({
      firstName: e.target.value
    })
  }

  handleUpdateLastName = (e) => {
    this.setState({
      lastName: e.target.value
    })
  }

  updateView() {
    axios.get(`/users/${this.state.email}`)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => console.log(err))
  }

  render() {
    return (
      <>
        <h1 className="Title">Settings<i className="fas fa-cog"></i></h1>
        <div className="fade settings">
          <div id="profileParent">
            <div id="profile">
              <i className="fas fa-user-circle"></i><h3>{this.state.firstName}</h3>
            </div>
            <button className="waves-effect waves-light btn" onClick={this.logout}>Log out</button>
          </div>
          <div id="table">
            <div className="row">
              <div>
                <p>Name</p>
                <h4>{this.state.firstName} {this.state.lastName}</h4>
              </div>
            </div>
            <div className="row">
              <div>
                <p>Email</p>
                <h4>{this.state.email}</h4>
              </div>
            </div>
          </div>
          <ul className="collapsible">
            <li>
              <div className="collapsible-header"><i className="material-icons">email</i>Update Email</div>
              <div className="collapsible-body">
                <div className="input-field ">
                    <input id="email" type="email" onChange={this.handleUpdateEmail} value={this.state.new_email}></input>
                    <label htmlFor="email">New Email</label>
                </div>
                <div className="input-field">
                  <label htmlFor="password">Password</label>
                  <input type="password" onChange={this.handleUpdatePassword} ></input>
                </div>
                <button className="waves-effect waves-light btn" onClick={this.updateEmail} >Save</button>
                </div>
            </li>
            <li>
              <div className="collapsible-header"><i className="material-icons">person</i>Update Name</div>
              <div className="collapsible-body">
                  <div className="input-field ">
                      <input type="text" value={this.state.firstName} onChange={this.handleUpdateFirstName}></input>
                      <label htmlFor="firstName">New First Name</label>
                  </div>
                  <div className="input-field ">
                      <input type="text" value={this.state.lastName} onChange={this.handleUpdateLastName}></input>
                      <label htmlFor="lastName">New Last Name</label>
                  </div>
                  <button className="waves-effect waves-light btn" onClick={this.updateProfile}>Save</button>
              </div>
            </li>
            <li>
                <div className="collapsible-header"><i className="material-icons">security</i>Update Password</div>
                <div className="collapsible-body">
                <p>Click the button below to receive an email with a link to reset your password.</p>
                <button className="waves-effect waves-light btn" onClick={this.updatePassword} >Send Email</button>
              </div>
            </li>
            <li>
              <div className="collapsible-header"><i className="material-icons">delete</i>Delete Account</div>
              <div className="collapsible-body">
              <p>If you are sure you want to delete your account, enter your password below. (This action cannot be undone).</p>
                <div className="input-field ">
                      <input id="confirmpassword" type="password" onChange={this.handleUpdatePassword}></input>
                      <label htmlFor="confirmpassword">Enter your password</label>
                </div>
                <button className="waves-effect waves-light btn" onClick={this.deleteAccount}>Delete Account</button>
                </div>
            </li>
          </ul>
          {this.state.showPasswordMessage ?
            <p className="passwordMessage">An email has been sent to your account with a link to reset your password.</p>
            : null
          }
          {
            this.state.showPasswordError ?
            <p className="passwordMessage">The email could not be sent.</p> : null
          }
        </div>
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    firstName: state.user.firstName,
    lastName: state.user.lastName,
    email: state.user.email,
    id: state.user.id
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout())
  }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings));
