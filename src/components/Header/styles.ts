import styled, { css } from "styled-components";

interface NavbarProps {
  isHeaderScrollActive: boolean;
}

export const Container = styled.header`
  position: fixed;
  z-index: 3;
  top: 0;
  width: 90vw;
  max-width: 1100px;
  transition: filter .2s;

  &:hover {
    filter: brightness(113%);
  }
`;

export const NavBar = styled.div<NavbarProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  border: 2px solid var(--divider-color);
  border-radius: 0 0 10px 10px;
  
  transition: background-color .3s, padding .3s;

  ${props => props.isHeaderScrollActive ?
    css`
  background-color: rgba(45, 45, 45, .95);
  padding: 0 10px 3px;
  ` :
    css`
  background-color: var(--primary-color);
  padding: 3px 10px;
  `}
  
  div {
    display: flex;
    gap: 10px;
  }
`;
