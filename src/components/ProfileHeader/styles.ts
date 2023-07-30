import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  padding-top: 70px;
`;

interface ButtonProps {
  position: number;
  currentPage?: string;
  pageName?: string;
}

const handleBorderRadius = (position: number) => {
  switch (position) {
    case 1:
      return css`border-radius: 8px 0 0 8px;`
    case 4:
      return css`border-radius: 0 8px 8px 0;`
    default:
      return css`border-radius: 0;`
  }
}

export const Button = styled.button<ButtonProps>`
  height: 4.5rem;
  background: var(--primary-color);
  color: #FFF;
  margin: 0 0 20px;
  padding: 10px;
  border: none;
  width: 18%;

  display: flex;
  justify-content: center;
  align-items: center;

  transition: filter .2s;

  &:hover {
    filter: brightness(113%);
  }

  ${props => handleBorderRadius(props.position)}

  @media (max-width: 500px) {
    height: 4rem;
  }

  p {
    padding: 5px;
    font-size: 2rem;
    font-weight: 500;
    border-radius: 8px;
    transition: background-color .2s, padding .3s;

    &:hover {
      background-color: rgba(0,0,0, 0.2);
    }

    &::after {
      content: '';
      display: block;
      height: 3px;
      border-radius: 10px;
      transition: width .2s ease-out;
      background-color: var(--text-color);

      ${props => props.currentPage ? (
        props.currentPage === props.pageName ?
          css`width: 100%;` :
          css`width: 0;`
        ) :
        css`width: 0;`
      }
    }

    &:hover::after {
      width: 100%;
      transition: width .2s ease-in;
    }

    @media (max-width: 500px) {
      font-weight: 400;
      font-size: 1.6rem;
    }
  }
`;
