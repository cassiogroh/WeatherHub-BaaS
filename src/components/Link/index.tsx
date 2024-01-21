import { Link as AnchorLink, LinkProps as LinkPropsDOM, useLocation } from "react-router-dom";

import { Container } from "./styles";

interface LinkProps extends LinkPropsDOM {
  isHeaderScrollActive: boolean;
  pageName: string;
}

const Link = ({ to, pageName, isHeaderScrollActive, ...rest }: LinkProps) => {
  const location = useLocation();

  return (
    <Container isActiveTab={to === location.pathname} isHeaderScrollActive={isHeaderScrollActive}>
      <AnchorLink to={to} {...rest}>{pageName}</AnchorLink>
    </Container>
  );
};

export default Link;
