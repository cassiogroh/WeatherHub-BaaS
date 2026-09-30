import styled, { css } from "styled-components";

export const Container = styled.div`
  position: relative;
  border: 0.2rem solid var(--divider-color);
  border-radius: 0.8rem;
  background: radial-gradient(var(--card-primary-color), var(--card-secondary-color));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.6rem;
  transition: filter .2s;

  &:hover {
    filter: brightness(113%);
  }
`;

export const CardStats = styled.div`
  width: 100%;
  
  a {
    display: flex;
    flex: 1;
    place-content: center;
    padding: 5px;
    border-radius: 10px;
    text-align: center;
    transition: background-color .2s;
    
    height: 28px;
    overflow: hidden;
    
    &:hover {
    background-color: rgba(0,0,0, 0.2);
    }
  }

  h4 {
    font-weight: 400;
    text-align: center;
    background-color: rgba(0,0,0, 0.2);
    border-radius: 10px;
    padding: 2px;
    margin: 2px 0;
  }

  p {
    display: flex;
    justify-content: space-between;
    padding: 3px;
    border-radius: 10px;
    transition: background-color .2s;

    &:hover {
      background-color: rgba(0,0,0, 0.2);
    }

    &:last-child {
      margin-bottom: 10px;
    }

    // Value the dashboard is sorted by
    &.highlighted {
      background-color: rgba(0,0,0, 0.25);
      font-weight: 600;
    }
  }

  div:last-child {
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
      width: 100%;
      justify-content: center;
      margin-bottom: 5px;
    }
  }
`;

interface RenameProps {
  inputFocus: boolean;
}

export const RenameField = styled.div<RenameProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;

  input {
    background-color: rgba(0,0,0, 0.1);
    padding-left: 10px;
    height: 28px;
    border-radius: 10px 0 0 10px;
    border: 2px solid transparent;
    border-right: none;
    outline: none;
    transition: background-color .2s, border-color .2s;
    width: 100%;

    &:focus {
      background-color: rgba(0,0,0, 0.3);
      border-color: white;
    }

    &:hover {
      background-color: rgba(0,0,0, 0.275);
    }
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: rgba(0,0,0, 0.2);
    border-radius: 0 10px 10px 0;
    border: 2px solid transparent;
    border-left: none;
    outline: none;
    transition: background-color .2s;
    transition: background-color .2s, border-color .2s;

    ${props => props.inputFocus && css`border-color: white;`}

    &:hover {
      background-color: rgba(0,0,0, 0.4);
    }
  }
`;

export const LastUpdateHour = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  font-size: 1rem;
`;

export const CardBottom = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    font-size: 1rem;
  }

  div {
    display: flex;
    align-content: center;
  }

  button {
    background-color: transparent;
    border: none;
    border-radius: 10px;
    padding: 4px;
    display: flex;
    align-content: center;
    transition: background-color .2s;
    outline: none;

    &:hover {
      background-color: rgba(0,0,0, 0.2);
    }
  }
`;

// Ranking position when the dashboard is sorted by a metric, sitting on the card corner
export const RankBadge = styled.span`
  position: absolute;
  z-index: 1;
  top: -0.9rem;
  left: -0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);

  display: grid;
  place-items: center;
  min-width: 2.8rem;
  height: 2.8rem;
  padding: 0 0.6rem;
  border-radius: 1.4rem;

  background-color: #fff;
  color: var(--primary-color);
  font-size: 1.3rem;
  font-weight: 700;
`;
