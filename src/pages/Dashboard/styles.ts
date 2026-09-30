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
  position: fixed;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: #333333ee;
  padding: 2rem;
  border-radius: 10px;
`;

// Room for the controls above; on mobile they stack under the add station input
const controlsSpacing = css`
  margin-top: 4rem;

  @media (max-width: 900px) {
    margin-top: 12.5rem;
  }
`;

export const RankingBar = styled.div`
  ${controlsSpacing}

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0.8rem 0.8rem 1.6rem;

  border-radius: 10px;
  background-color: #fff1;

  p {
    margin: 0;
  }

  button {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 3.4rem;
    padding: 0 12px;

    border: 0;
    border-radius: 8px;
    background-color: var(--primary-color);
    color: #fff;
    cursor: pointer;
    transition: filter .2s;

    &:hover {
      filter: brightness(113%);
    }
  }
`;

interface StationsStatsProps {
  $hasRankingBar: boolean;
}

export const StationsStats = styled.div<StationsStatsProps>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  ${({ $hasRankingBar }) => $hasRankingBar ? css`margin-top: 1.6rem;` : controlsSpacing}
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  background-color: #fff1;
  width: fit-content;
  border-radius: 10px;
  margin: 2rem auto 0;
`;

export const PaginationButton = styled.button`
  border: none;
  background-color: transparent;
  padding: 0.5rem 1.5rem;
  color: #fff;
  cursor: pointer;
  opacity: 0.4;
  border-radius: 10px;
  position: relative;
  
  &:disabled {
    opacity: 1;
    cursor: not-allowed;
    background-color: #fff1;
  }

  &:hover:not(:disabled) {
    background-color: #fff5;
  }

  &:not(:first-child):before {
    content: '|';
    position: absolute;
    left: -2px;
    color: #fff5;
  }
`;
