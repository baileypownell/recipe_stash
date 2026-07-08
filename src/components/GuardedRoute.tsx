import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AuthenticationService from '../services/auth-service';

interface GuardedRouteProps {
  children: ReactNode;
}

const GuardedRoute = (props: GuardedRouteProps) =>
  AuthenticationService.authenticated() ? (
    props.children
  ) : (
    <Navigate to="/login" />
  );

export default GuardedRoute;
