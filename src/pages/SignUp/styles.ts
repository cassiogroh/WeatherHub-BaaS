import styled, { keyframes } from 'styled-components';

import backgroundImg from '../../assets/sign-up-background.png';

export const Container = styled.div`
  padding-top: 80px;
`;

const AppearFromBehind = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Background = styled.div`
  animation: ${AppearFromBehind} 2s;

  @media (max-width: 980px) {
    h1 {
      width: 0;
      overflow: hidden;
    }
  }

  @media (min-width: 980px) {
    background: url(${backgroundImg}) no-repeat center;
    background-position-y: 80px;
    background-size: contain;
    height: 400px;
    width: 400px;
    margin-right: 100px;

    h1 {
      text-align: center;
    }
  }
`;

export const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 50px;
`;

const AppearFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const AnimationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  animation: ${AppearFromRight} 1s;

  form {
    margin: 40px 0;
    width: 340px;
    text-align: center;

    h1 {
      margin-bottom: 24px;
      color: var(--text-color)
    }
  }

  > a {
    color: var(--primary-color);
    display: block;
    margin-top: 24px;
    text-decoration: none;
    transition: filter 0.2s;

    display: flex;
    align-items: center;

    svg {
      margin-right: 16px;
    }

    &:hover {
      filter: brightness(120%);
    }
  }
`;