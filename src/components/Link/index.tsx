import { Link as AnchorLink, LinkProps as LinkPropsDOM } from "react-router-dom";

import { Container } from "./styles";

interface LinkProps extends LinkPropsDOM {
  isHeaderScrollActive: boolean;
  pageName: string;
}

const Link = ({ to, pageName, isHeaderScrollActive, ...rest }: LinkProps) => {
  const currentPage = window.location.pathname;

  return (
    <Container isActiveTab={to === currentPage} isHeaderScrollActive={isHeaderScrollActive}>
      <AnchorLink to={to} {...rest}>{pageName}</AnchorLink>
    </Container>
  );
};

export default Link;
