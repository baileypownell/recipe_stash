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
    const { id, category } = this.props;
    return (
      <>
        <div
          className="addRecipe z-depth-4"
          id={id}
          onClick={this.addRecipe} >
          <i className="fas fa-plus-circle"></i>
        </div>
        {this.state.showModal ?
        <Modal
          id={id}
          category={category}
          closeModal={this.closeModal}
          updateDashboard={this.props.updateDashboard}
        />
        : null}
      </>
    )
  }
}

export default AddRecipe;
