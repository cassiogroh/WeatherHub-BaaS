import styled, { css } from 'styled-components';

interface ContainerProps {
  disabled: boolean;
}

export const Container = styled.label<ContainerProps>`
  display: flex;
  align-items: center;
  justify-content: left;
  padding-left: 3px;

  cursor: pointer;

  &:hover {
    background-color: rgba(0,0,0, 0.2);
  }

  input {
    margin-right: 5px;
    margin-left: 3px;

    ${props => props.disabled && css`opacity: 0.5`}
  }

  p {
    margin: 0 !important;
    transition: opacity .3s;
    
    ${props => props.disabled && css`opacity: 0.5`}
  }
`;