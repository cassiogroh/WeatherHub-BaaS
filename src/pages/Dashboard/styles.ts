import styled, { css } from "styled-components";

interface ContainerProps {
  isLoading: boolean;
}

export const Container = styled.div<ContainerProps>`
  padding-bottom: 50px;

  ${({ isLoading }) =>
    isLoading &&
    css`
    opacity: 0.60;
    pointer-events: none;
    `
}
`;

export const LoaderContainer = styled.div`
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: #333333ee;
  padding: 2rem;
  border-radius: 10px;
`;

export const StationsStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;
