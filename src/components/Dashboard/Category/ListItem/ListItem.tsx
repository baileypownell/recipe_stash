import React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import './ListItem.scss'

interface Props extends RouteComponentProps {
  recipeId: string
  key: string
  rawTitle: string
}

const ListItem = (props: Props) => {
  const viewRecipe = () => {
    props.history.push(`/recipes/${props.recipeId}`)
  }

  const { key, rawTitle } = props
  return (
    <div
      className="list-item hoverable"
      key={key}
      onClick={viewRecipe}
    >
      <h4>{rawTitle}</h4>
    </div>
  )
}

export default withRouter(ListItem)

