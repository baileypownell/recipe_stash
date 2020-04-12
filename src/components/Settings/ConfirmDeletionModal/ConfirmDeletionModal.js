import React from 'react';

import './ConfirmDeletionModal.scss';

class ConfirmDeletionModal extends React.Component {
  render() {
    return (
      <div className="modal">
        <i
          onClick={this.props.closeModal}
          className="fas fa-times-circle">
        </i>
        <form className="deleteAccount">
          <h3>If you are sure you want to delete your account, enter your password below. (This action cannot be undone).</h3>
          <input type="password"></input>
          <button onClick={this.deleteAccount}>Delete Account</button>
        </form>
      </div>
    )
  }
}

export default ConfirmDeletionModal;
