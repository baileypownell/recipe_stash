import React from 'react';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import * as actions from '../../../../store/actionCreators';
class Square extends React.Component {

  state = {
    data: this.props.data
  }

  viewRecipe = () => {
    this.props.history.push(`/dashboard/${this.state.data.id}`);
  }

  render() {
    return (
      <div
        className="recipeCard"
        key={this.props.key}
        data={this.props.data}
        onClick={this.viewRecipe}
      >
          <h3>{this.props.title}</h3>
      </div>
    )
  }
}




export default withRouter(Square);
