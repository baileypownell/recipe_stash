import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import * as actions from '../../../store/actionCreators';
import ClipLoader from "react-spinners/ClipLoader";
import './EditEmailModal.scss';

class EditEmailModal extends React.Component {
  state = {
    password: '',
    email: '',
    loading: false,
    authenticationError: false,
    authenticationSuccess: false
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  updateEmail = (e) => {
    e.preventDefault();
    this.setState({
      loading: true
    });
    axios.post(`${process.env.API_URL}/resetEmail`, {
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

  render() {
    return (
      <div className="modal">
      <i
        onClick={this.props.closeModal}
        className="fas fa-times-circle">
      </i>
        <form onSubmit={this.updateEmail}>
          <label>New Email</label>
          <input type="email" id="email" onChange={this.updateInput}></input>
          <label>New Password</label>
          <input type="password" id="password" onChange={this.updateInput}></input>
          <button>
          {this.state.loading ?
            <ClipLoader
              css={`border-color: white;`}
              size={30}
              color={"white"}
              loading={this.state.loading}
            />
            : `Update Email`}
          </button>
        </form>
        {this.state.authenticationError ?
          <p>Incorrect password.</p>
        : null}
        {this.state.authenticationSuccess ?
          <p>Email updated successfully.</p>
        : null}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateEmail: (newEmail) => dispatch(actions.updateEmail(newEmail))
  }
}

export default connect(null, mapDispatchToProps)(EditEmailModal);
