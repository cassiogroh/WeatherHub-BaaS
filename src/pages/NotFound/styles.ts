import styled, { keyframes } from 'styled-components';

export const Container = styled.div`
  
  padding-top: 150px;

  @media (max-width: 500px) {
    padding-top: 100px;
  }
`;

const AppearFromBehind = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const AnimationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    margin-bottom: 30px;
    text-align: center;
  }

  animation: ${AppearFromBehind} 1s;
`;