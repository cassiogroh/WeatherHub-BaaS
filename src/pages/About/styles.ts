import styled, { keyframes } from 'styled-components';

import logoImg from '../../assets/logo.png';

export const Container = styled.div`
  display: flex;
  align-items: center;
  padding-top: 150px;

  @media (max-width: 500px) {
    padding-top: 100px;
  }
`;

const AppearFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const AnimationContainer = styled.div`
  margin: 0 100px;
  width: 50%;


  animation: ${AppearFromLeft} 1s;
  
  p {
    text-align: justify;
  }

  @media (max-width: 980px) {
    margin: 0 auto;
    width: 60%;
  }

  @media (max-width: 500px) {
    margin: 0 auto;
    width: 80%;
  }

`;

export const Background = styled.div`
  background: url(${logoImg}) no-repeat center;
  background-size: 300px;
  height: 350px;
  width: 350px;

  @media (max-width: 980px) {
    position: absolute;
    z-index: -1;
    opacity: 20%;
    left: 50%;
    top: 50%;
    margin-left: -175px;
    margin-top: -175px;
  }

  @media (max-width: 500px) {
    background-size: 200px;
    height: 200px;
    width: 200px;
    margin-left: -100px;
    margin-top: -100px;
  }
`;