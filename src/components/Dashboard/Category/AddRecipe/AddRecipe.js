import React from 'react';
import Modal from '../../../Modal/Modal';


class AddRecipe extends React.Component {

  state = {
    showModal: false
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  addRecipe = () => {
    this.setState({
      showModal: true
    })
  }
  render() {
    return (
      <>
        <div
          className="addRecipe"
          id={this.props.id}
          onClick={this.addRecipe} >
          <i className="fas fa-plus-circle"></i>
        </div>
        {this.state.showModal ?
        <Modal
          id={this.props.id}
          category={this.props.category}
          closeModal={this.closeModal}
          updateDashboard={this.props.updateDashboard}
        />
        : null}
      </>
    )
  }
}

export default AddRecipe;
