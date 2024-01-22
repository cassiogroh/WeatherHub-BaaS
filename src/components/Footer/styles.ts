import styled from "styled-components";

export const Container = styled.footer`
  position: fixed;
  left: 50%;
  bottom: 10px;
  z-index: 3;
  transform: translateX(-50%);

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  opacity: 30%;
  pointer-events: none;

  img {
    width: 20px;
  }
`;
