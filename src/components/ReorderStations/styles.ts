import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  margin-top: 4rem;

  > p {
    opacity: 0.8;
    font-size: 1.4rem;
  }

  @media (max-width: 900px) {
    margin-top: 8rem;
  }
`;

// One panel per dashboard page
export const PageGroup = styled.section`
  padding: 1.2rem;
  border-radius: 1rem;
  background-color: #fff1;

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 0 0.4rem;
  }

  header strong {
    font-size: 1.6rem;
  }

  header span {
    font-size: 1.3rem;
    opacity: 0.7;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

interface CardProps {
  isDragging: boolean;
}

export const Card = styled.div<CardProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.8rem 1rem 1.2rem;

  border: 0.2rem solid var(--divider-color);
  border-radius: 0.8rem;
  background: radial-gradient(var(--card-primary-color), var(--card-secondary-color));

  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
  transition: filter .2s, box-shadow .2s, border-color .2s;

  &:hover {
    filter: brightness(113%);
  }

  ${({ isDragging }) => isDragging && css`
    cursor: grabbing;
    z-index: 3;
    border-color: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    filter: brightness(113%);
  `}

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  }

  // Position badge
  strong {
    display: grid;
    place-items: center;
    min-width: 2.4rem;
    height: 2.4rem;
    padding: 0 0.6rem;
    border-radius: 1.2rem;
    background-color: #fff;
    color: var(--primary-color);
    font-size: 1.3rem;
    font-weight: 700;
  }

  small {
    flex: 1;
    font-size: 1.1rem;
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button {
    display: flex;
    padding: 0.4rem;
    border: 0;
    border-radius: 0.6rem;
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
    transition: color .2s, background-color .2s;

    &:hover,
    &:focus-visible {
      color: #FF9077;
      background-color: rgba(0, 0, 0, 0.2);
    }
  }

  // Station name, at most three lines (four on mobile, where cards are narrower)
  span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    min-height: 2.6em;
    line-height: 1.3;

    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    overflow-wrap: anywhere;

    @media (max-width: 700px) {
      -webkit-line-clamp: 4;
    }
  }
`;
