import styled from "styled-components";

export const Container = styled.button`
  background: var(--primary-color);
  height: 56px;
  border-radius: 10px;
  border: 0;
  padding: 0 16px;
  color: var(--text-color);
  width: 100%;
  font-weight: 500;
  margin-top: 16px;
  outline: none;
  transition: filter 0.2s;
  text-transform: uppercase;

  &:hover { 
    filter: brightness(80%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
