import styled, { css } from 'styled-components';

import Tooltip from '../Tooltip';

interface ContainerProps {
  isFocused: boolean;
  isFilled: boolean;
  isErrored: boolean;
}

export const Container = styled.div<ContainerProps>`
  background: #333;
  border-radius: 10px;
  padding: 16px;
  width: 100%;

  border: 2px solid #333;
  color: #666360;

  display: flex;
  align-items: center;

  & + div {
    margin-top: 8px;
  }

  ${props => props.isErrored && css`
  border-color: #C53030;
  `}

  ${props => props.isFocused && css`
    color: var(--primary-color);
    border-color: var(--primary-color);
  `}

  ${props => props.isFilled && css`
    color: var(--primary-color);
  `}

  input {
    flex: 1;
    background: transparent;
    border: 0;
    color: #F4EDE8;
    padding-left: 10px;
    outline: none;

    &:-webkit-autofill,
    &:-webkit-autofill:hover, 
    &:-webkit-autofill:focus {
      background-color: yellow;
      border: 0;
      -webkit-text-fill-color: #F4EDE8;
      -webkit-box-shadow: 0 0 0px 1000px #333 inset;
      box-shadow: 0 0 0px 1000px #333 inset;
    }

    &::placeholder {
      color: #666360;
    }
  }

  svg {
    margin-right: 16px;
  }
`;

export const Error = styled(Tooltip)`
  height: 20px;
  margin-left: 16px;

  svg {
    margin: 0;
  }

  span {
    background: #C53030;
    color: #FFF;

    &::before {
      border-color: #C53030 transparent;
    }
  }
`;