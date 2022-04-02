import React from 'react'
import { IconButton } from '@material-ui/core'
import { withRouter } from 'react-router-dom'

const InnerNavigationBar = (props: {title: string, icon?: string}) => {
  const goBack = () => {
    props.history.push('/recipes')
  }

  return (
    <h1 className="title">
      { props.icon
        ? <span style={{ marginRight: '8px' }} dangerouslySetInnerHTML={{ __html: props.icon }}></span>
        : <IconButton style={{ padding: '0', marginRight: '8px' }}>
            <i onClick={goBack} className="fas fa-chevron-circle-left"></i>
          </IconButton>
      }
      <span style={{ display: 'inline-block', marginLeft: '5px' }} dangerouslySetInnerHTML={{ __html: props.title }}/>
    </h1>
  )
}

export default withRouter(InnerNavigationBar)
