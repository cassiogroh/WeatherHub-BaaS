import styled, { css } from 'styled-components';

export const Container = styled.div`
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
  text-align: left;
  width: 100%;
  
  a {
    display: flex;
    flex: 1;
    place-content: center;
    margin-bottom: 10px;
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

interface RenameProps {
  inputFocus: boolean;
}

export const RenameField = styled.div<RenameProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 10px;

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