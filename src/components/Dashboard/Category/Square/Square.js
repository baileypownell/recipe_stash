import React from 'react';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import * as actions from '../../../../store/actionCreators';

class Square extends React.Component {


  viewRecipe = () => {
    this.props.history.push(`/dashboard/${this.props.data.id}`);
  }

  render() {
    const { data, key, title } = this.props;
    return (
      <div
        className="recipeCard"
        key={key}
        data={data}
        onClick={this.viewRecipe}
      >
        <h3>{title}</h3>
      </div>
    )
  }
}

export default withRouter(Square);
