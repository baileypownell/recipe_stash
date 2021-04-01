import React from 'react';
import { withRouter } from "react-router-dom";
import './Square.scss'

class Square extends React.Component {


  viewRecipe = () => {
    this.props.history.push(`/recipes/${this.props.data.id}`);
  }

  render() {
    const { data, key, rawTitle, awsUrl } = this.props;
    return (
      <div
        style={{ backgroundImage: `url(${awsUrl})`}}
        id={ !!awsUrl ? 'default-tile-image' : null}
        className={ !!awsUrl ? 'recipe-card z-depth-4 gray-background' : 'recipe-card z-depth-4'}
        key={key}
        data={data}
        onClick={this.viewRecipe}
      >
        <h4>{rawTitle}</h4>
      </div>
    )
  }
}

export default withRouter(Square);
