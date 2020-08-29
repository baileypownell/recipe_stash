import React from 'react';
import { withRouter } from "react-router-dom";

class Square extends React.Component {


  viewRecipe = () => {
    this.props.history.push(`/view-recipe/${this.props.data.id}`);
  }

  render() {
    const { data, key, title } = this.props;
    return (
      <div
        className="recipeCard z-depth-4"
        key={key}
        data={data}
        onClick={this.viewRecipe}
      >
        <h4>{title}</h4>
      </div>
    )
  }
}

export default withRouter(Square);
