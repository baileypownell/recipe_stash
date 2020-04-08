import React from 'react';
import './ConfirmationModal.scss';

const ConfirmationModal = (props) => {
  return (
    <div className="modal">
      <h2>{props.text}</h2>
      <div>
        <button onClick={props.confirmAction}>{props.options[0]}</button>
        <button onClick={props.closeModal}>{props.options[1]}</button>
      </div>
    </div>
  )
}

export default ConfirmationModal;
