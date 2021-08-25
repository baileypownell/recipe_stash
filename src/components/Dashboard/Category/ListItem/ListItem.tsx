import React, { Props } from 'react'
import { withRouter } from 'react-router-dom'
import './ListItem.scss'

class ListItem extends React.Component<Props> {
  viewRecipe = () => {
    this.props.history.push(`/recipes/${this.props.data.id}`)
  }

  render () {
    const { data, key, rawTitle } = this.props
    return (
      <div
        className="list-item hoverable"
        key={key}
        data={data}
        onClick={this.viewRecipe}
      >
        <h4>{rawTitle}</h4>
      </div>
    )
  }
}

export default withRouter(ListItem)

