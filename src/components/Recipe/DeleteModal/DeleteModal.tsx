import React from 'react';
import './DeleteModal.scss'

const DeleteModal = (props: any) => {
    return (
        <div id="deletion-modal">
            <div className="modal-content">
                <h4>Are you sure?</h4>
                <p>Deleting this recipe cannot be undone.</p>
            </div>
            <div className="modal-footer">
                <a id="primary-color" className="modal-close waves-effect waves-green btn">Cancel</a>
                <a className="modal-close waves-effect waves-green btn-flat" onClick={props.deleteRecipe}>Continue</a>
            </div>
        </div>
    )
}

export default DeleteModal