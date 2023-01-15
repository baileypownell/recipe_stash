import { IconButton, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router'
import './InnerNavigationBar.scss'

interface Props {
  title: string
  icon?: string
}

const InnerNavigationBar = (props: Props) => {
  const navigate = useNavigate()
  return (
    <Typography variant="h6" className="inner-navigation-bar">
      {props.icon
        ? <span style={{ marginRight: '8px' }} dangerouslySetInnerHTML={{ __html: props.icon }}></span>
        : <IconButton style={{ padding: '0', marginRight: '8px' }} onClick={() => navigate('/recipes')}>
          <i className="fas fa-chevron-circle-left"></i>
        </IconButton>
      }
      <span style={{ display: 'inline-block', marginLeft: '5px' }} dangerouslySetInnerHTML={{ __html: props.title }} />
    </Typography>
  )
}

export default InnerNavigationBar
