import React from 'react'
import { Navigate } from 'react-router-dom'
import AuthenticationService from './services/auth-service'

const GuardedRoute = (props: any) => ( AuthenticationService.authenticated() ? props.children : <Navigate to="/login" /> )

export default GuardedRoute
