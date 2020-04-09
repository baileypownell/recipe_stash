import React from 'react';
import { connect } from 'react-redux';
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
    if (this.props.email) {
      this.setState({
        email: this.props.email
      })
    }
    if (this.props.firstName) {
      this.setState({
        firstName: this.props.firstName
      })
    }
    if (this.props.lastName) {
      this.setState({
        lastName: this.props.lastName
      })
    }
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  updateProfile = (e) => {
    e.preventDefault();
    this.setState({
      loading: true
    });
    let payload;
    if (this.props.property === 'name') {
      payload = {
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        id: this.props.id
      }
    } else {
      payload = {
        email: this.state.email,
        id: this.props.id
      }
    }
    console.log(payload)
    axios.put(`${process.env.API_URL}/updateProfile`, payload)
    .then((res) => {
      this.setState({
        loading: false
      });
      this.props.closeModal();
      // then update the page by updating redux

    })
    .catch(err => {console.log(err)})
  }

  render() {
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
            value={this.state.email}
            type="text"
            onChange={this.updateInput}></input>
        </label>
        :
        <>
        <label>
          <input
            id="firstName"
            value={this.state.firstName}
            type="text"
            onChange={this.updateInput}>
          </input>
        </label>
        <label>
          <input
            id="lastName"
            value={this.state.lastName}
            type="text"
            onChange={this.updateInput}>
          </input>
        </label>
        </>
      }
      <button
        onClick={this.updateProfile}
        >
        {this.state.loading ?
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

export default connect(mapStateToProps)(EditProfileModal);
