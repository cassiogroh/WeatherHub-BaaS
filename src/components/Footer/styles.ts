import styled from 'styled-components';

export const Container = styled.footer`
  position: relative;
  
  p {
    position: fixed;
    left: 50%;
    margin-left: -150px;
    width: 300px;
    bottom: 10px;
    z-index: 3;

    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    padding: 5px;
    opacity: 10%;
    transition: opacity .3s, background-color .3s;

    &:hover {
      opacity: 100%;
      background-color: rgba(45,45,45, 0.85);
    }

    a {
      margin: 0 5px;
    }

    img {
      margin-left: 15px;
      width: 20px;
    }
  }
`;