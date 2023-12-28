import styled from "styled-components";

export const Container = styled.footer`
  position: relative;
  
  p {
    position: fixed;
    left: 50%;
    bottom: 10px;
    z-index: 3;
    transform: translateX(-50%);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;

    border-radius: 10px;
    padding: 5px 10px;
    opacity: 10%;
    transition: opacity .3s, background-color .3s;

    &:hover {
      opacity: 100%;
      background-color: rgba(45,45,45, 0.85);
    }

    img {
      width: 20px;
    }
  }
`;
