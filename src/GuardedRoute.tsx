import React from 'react'
import { Route, Redirect } from 'react-router-dom'

const GuardedRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!window.localStorage.getItem('user_logged_in')
  return (
    <Route {...rest} render={(props) => (
      isAuthenticated === true
        ? <Component {...props} />
        : <Redirect to='/login' />
    )} />
  )
}

export default GuardedRoute
