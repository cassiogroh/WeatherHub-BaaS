import React from 'react';
import { Link as AnchorLink, LinkProps as LinkPropsDOM } from 'react-router-dom';

import { Container } from './styles';

interface LinkProps extends LinkPropsDOM {
  pageName: string;
  currentPage: string;
  activateNavbar: boolean;
}

const Link: React.FC<LinkProps> = ({ to, pageName, currentPage, activateNavbar, ...rest }: LinkProps) => {
  return (
    <Container pageName={pageName} currentPage={currentPage} activateNavbar={activateNavbar}>
      <AnchorLink to={to} {...rest}>{pageName}</AnchorLink>
    </Container>
  )
}

export default Link;