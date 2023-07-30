import React, { ButtonHTMLAttributes } from 'react';

import { Container } from './styles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>; // empty interface

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => (
  <Container type='button' { ...rest }>
    { children }
  </Container>
);

export default Button;