import React from 'react'
import { IconButton } from '@material-ui/core'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import './InnerNavigationBar.scss'

interface Props extends RouteComponentProps {
  title: string
  icon?: string
}

const InnerNavigationBar = (props: Props) => {
  return (
    <h1 className="inner-navigation-bar">
      { props.icon
        ? <span style={{ marginRight: '8px' }} dangerouslySetInnerHTML={{ __html: props.icon }}></span>
        : <IconButton style={{ padding: '0', marginRight: '8px' }} onClick={() => props.history.push('/recipes')}>
            <i className="fas fa-chevron-circle-left"></i>
          </IconButton>
      }
      <span style={{ display: 'inline-block', marginLeft: '5px' }} dangerouslySetInnerHTML={{ __html: props.title }}/>
    </h1>
  )
}

export default withRouter(InnerNavigationBar)
