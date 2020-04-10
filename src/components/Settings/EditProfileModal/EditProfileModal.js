import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../store/actionCreators';
const axios = require('axios');
import ClipLoader from "react-spinners/ClipLoader";
import './EditProfileModal.scss';

class EditProfileModal extends React.Component {

  state = {
    firstName: '',
    lastName: '',
    email: '',
    loading: false
  }

  componentDidMount() {
    const {email, firstName, lastName} = this.props;
    if (email) {
      this.setState({
        email: email
      })
    }
    if (firstName) {
      this.setState({
        firstName: firstName
      })
    }
    if (lastName) {
      this.setState({
        lastName: lastName
      })
    }
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  updateProfile = (e) => {
    const { firstName, lastName, email } = this.state;
    const { id, property } = this.props;
    e.preventDefault();
    this.setState({
      loading: true
    });
    let payload;
    if (property === 'name') {
      payload = {
        first_name: firstName,
        last_name: lastName,
        id: id
      }
    } else {
      payload = {
        email: email,
        id: id
      }
    }
    axios.put(`${process.env.API_URL}/updateProfile`, payload)
    .then((res) => {
      this.setState({
        loading: false
      });
      this.props.closeModal();
      // then update the page by updating redux
      if (property === 'email') {
        this.props.updateEmail(email)
      } else if (property === 'name') {
        this.props.updateName(firstName, lastName)
      }
    })
    .catch(err => {console.log(err)})
  }

  render() {
    const { email, firstName, lastName, loading } = this.state;
    return (
      <div className="modal">
        <i
          onClick={this.props.closeModal}
          className="fas fa-times-circle">
        </i>
        <h2>New {this.props.property}</h2>

      {this.props.property === 'email' ?
        <label>
          <input
            id="email"
            value={email}
            type="email"
            onChange={this.updateInput}></input>
        </label>
        :
        <>
        <label>
          <input
            id="firstName"
            value={firstName}
            type="text"
            onChange={this.updateInput}>
          </input>
        </label>
        <label>
          <input
            id="lastName"
            value={lastName}
            type="text"
            onChange={this.updateInput}>
          </input>
        </label>
        </>
      }
      <button
        onClick={this.updateProfile}
        >
        {loading ?
          <ClipLoader
            css={`border-color: #dd4444;`}
            size={30}
            color={"#dd4444"}
            loading={this.state.loading}
            />
          : 'Submit'}</button>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    id: state.user.id
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateEmail: (email) => dispatch(actions.updateEmail(email)),
    updateName: (firstName, lastName) => dispatch(actions.updateName(firstName, lastName))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfileModal);
