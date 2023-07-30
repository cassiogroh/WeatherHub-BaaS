import styled, { css } from 'styled-components';

interface RequestProps {
  triggerAddLoader: boolean;
}

export const Container = styled.div<RequestProps>`
  padding-bottom: 50px;

  main {
    position: fixed;
    z-index: 1;
    top: 50%;
    left: 50%;
    margin-left: -10vw;
    margin-top: -10vw;
    height: 20vw;
    width: 20vw;
    border-radius: 50%;
    background: radial-gradient(#333, rgba(0,0,0, 0.7));

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    ${props => props.triggerAddLoader ?
    css`
      visibility: visible;
    `:
    css`
      visibility: hidden;
    `
    }

    @media (max-width: 600px) {
      margin-left: -20vw;
      margin-top: -20vw;
      height: 40vw;
      width: 40vw;
    }
  }
`;

export const StationsStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;