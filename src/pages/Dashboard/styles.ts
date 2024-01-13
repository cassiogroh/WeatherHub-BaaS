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

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

export const PaginationButton = styled.button`
  border: none;
  background-color: transparent;
  padding: 0.5rem 1rem;
  color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const PageIndicator = styled.span`
  color: #fff;
  margin: 0 1rem;
`;
