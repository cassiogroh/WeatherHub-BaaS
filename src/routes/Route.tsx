import {
  Route as ReactDOMRoute,
  RouterProps as ReactDOMRouteProps,
} from "react-router-dom";

import { useAuth } from "../hooks/auth";
import SignIn from "../pages/SignIn";
import Home from "../pages/Home";

interface RouteProps extends ReactDOMRouteProps {
  isPrivate?: boolean;
  component: React.ComponentType;
}

const Route = ({ isPrivate = false, component: Component, ...rest }: RouteProps) => {
  const { user } = useAuth();
  const hasAccess = isPrivate === !!user;
  const hasNoAccess = isPrivate && !user;

  const Fallback = hasNoAccess ? SignIn : Home;

  return (
    <ReactDOMRoute
      {...rest}
      Component={hasAccess ? Component : Fallback}
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
