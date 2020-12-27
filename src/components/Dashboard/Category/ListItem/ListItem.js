import React from 'react'
import { withRouter } from "react-router-dom"
import './ListItem.scss'

class ListItem extends React.Component {


  viewRecipe = () => {
    this.props.history.push(`/view-recipe/${this.props.data.id}`);
  }

  render() {
    const { data, key, title } = this.props;
    return (
      <div
        className="list-item hoverable"
        key={key}
        data={data}
        onClick={this.viewRecipe}
      >
        <h4>{title}</h4>
      </div>
    )
  }
}

export default withRouter(ListItem);
