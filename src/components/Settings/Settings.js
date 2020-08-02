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
    editEmail: false
  }

  logout = () => {
    this.props.logout();
    this.props.history.push('/home')
  }

  showModal = () => {
    this.setState({
      showModal: true
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  closeEmailModal = () => {
    this.setState({
      editEmail: false
    })
  }


  toggleConfirmationModal = () => {
    this.setState(prevState => ({
      showConfirmation: !prevState.showConfirmation
    }))
  }

  resetPassword = () => {
    this.setState({
      loading: true
    })
    axios.post(`/sendResetEmail`, {
      email: this.props.email
    })
    .then(res => {
      if (res.data.success === false) {
        this.setState({
          showPasswordError: true,
          loading: false
        })
      } else {
        this.setState({
          showPasswordMessage: true,
          loading: false
        })
      }
    })
    .catch(err => {
      this.setState({
        loading: false
      })
    })
  }

  showEmailModal = () => {
    this.setState({
      editEmail: true
    });
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
  this.setState({
    loading: true
  });
  let payload = {
      first_name: firstName,
      last_name: lastName,
      id: id
  }
  axios.put(`/users`, payload)
  .then((res) => {
    this.setState({
      loading: false
    });
    this.props.closeModal();
    // then update the page by updating redux
    this.props.updateName(firstName, lastName)
  })
  .catch(err => {console.log(err)})
}

updateEmail = (e) => {
  e.preventDefault();
  this.setState({
    loading: true
  });
  axios.put(`/users`, {
    new_email: this.state.email,
    password: this.state.password,
    id: this.props.id
  })
  .then(res => {
    this.setState({
      loading: false
    });
    if (res.data.success === false) {
      this.setState({
        authenticationError: true
      })
    } else if (res.data.success === true) {
      this.setState({
        authenticationSuccess: true
      });
      // update Redux
      this.props.updateEmail(this.state.email);
    }
  })
  .catch(err => {
    console.log(err);
    this.setState({
      loading: false
    });
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
    console.log(res)
    if (res.data.success === false) {
      this.setState({
        authenticationError: 'The password you entered is incorrect.',
        loading: false
      })
    } else {
      axios.delete(`/users/${this.props.id}`)
      .then((res) => {
        axios.delete(`/recipes/all/${this.props.id}`)
        .then(res => {
          console.log(res)
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
  })
}

  render() {
    return (
      <>
        <h1 className="Title">Settings<i className="fas fa-cog"></i></h1>
        <div className="fade settings">
          <div id="profileParent">
            <div id="profile">
              <i className="fas fa-user-circle"></i><h2>{this.props.firstName}</h2>
            </div>
            <button className="waves-effect waves-light btn" onClick={this.logout}>Log out</button>
          </div>
          <div id="table">
            <div className="row">
              <div>
                <p>Name</p>
                <h3>{this.props.firstName} {this.props.lastName}</h3>
              </div>
            </div>
            <div className="row">
              <div>
                <p>Email</p>
                <h3>{this.props.email}</h3>
              </div>
            </div>
          </div>
          <ul className="collapsible">
            <li>
              <div className="collapsible-header"><i className="material-icons">email</i>Update Email</div>
              <div className="collapsible-body">
                <div className="input-field ">
                    <input id="email" type="email"></input>
                    <label htmlFor="email">Email</label>
                  </div>
                </div>
            </li>
            <li>
              <div className="collapsible-header"><i className="material-icons">person</i>Update Name</div>
              <div className="collapsible-body">
                <div className="input-field ">
                    <input id="name" type="text" ></input>
                    <label htmlFor="name">Name</label>
                  </div>
              </div>
            </li>
            <li>
              <div className="collapsible-header"><i className="material-icons">security</i>Update Password</div>
              <div className="collapsible-body">
              <div className="input-field ">
                    <input id="password" type="password"></input>
                    <label htmlFor="password">Password</label>
                  </div>
              </div>
            </li>
            <li>
              <div className="collapsible-header"><i className="material-icons">delete</i>Delete Account</div>
              <div className="collapsible-body">
              <p>If you are sure you want to delete your account, enter your password below. (This action cannot be undone).</p>
                <div className="input-field ">
                      <input id="confirmpassword" type="password"></input>
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
