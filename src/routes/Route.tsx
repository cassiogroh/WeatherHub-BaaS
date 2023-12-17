import React from 'react';
import {
  Route as ReactDOMRoute,
  RouteProps as ReactDOMRouteProps,
  useNavigate
} from 'react-router-dom';

import { useAuth } from '../hooks/auth';

interface RouteProps extends ReactDOMRouteProps {
  isPrivate?: boolean;
  component: React.ComponentType;
}

const Route: React.FC<RouteProps> = ({ isPrivate = false, component: Component, ...rest }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ReactDOMRoute
      {...rest}
      render={({ location }) => {
        return isPrivate === !!user ? (
          <Component />
        ) : (
          isPrivate && !user ?
          navigate('/signin') : null
        );
      }}
    />
  );
};

export default Route;

/**
 *   private true && user true = component
 *   private false && user false = component
 *   private true && user false = redirect '/'
 *   private false && user true = component
 */