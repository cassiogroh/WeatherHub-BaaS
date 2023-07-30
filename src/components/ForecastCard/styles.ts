import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  border-radius: 10px;
  /* border: 3px solid white; */
  background: var(--primary-color);
  padding: 3px;
  overflow: hidden;
  transition: filter .3s;

  &:hover {
    filter: brightness(113%);
  }

  h2 {
    text-align: center;
  }

  main {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin: 0;
    border-radius: 10px;
  }

  div {
    width: 100%;
    height: 160px;
    margin: 2px 3px;
    background: rgba(0,0,0, 0.2);
    border-radius: 10px;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    transition: filter .2s;

    &:hover {
      filter: brightness(113%);
    }
  }

  main div p {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.4rem;
    white-space: nowrap;
  }

  img {
    height: 70px;
    width: 70px;
    margin: 3px;
    padding: 0;
  }

  h4 {
    text-align: center;
    border-radius: 10px;
    background: rgba(0,0,0, 0.2);
    margin: 2px 3px;
    font-weight: 400;
    padding: 3px;
    font-size: 1.4rem;
    height: 42px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  footer div {
    height: 100%;
    padding: 2px;
  }

  footer div p {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    line-height: 10px;
    font-size: 1.4rem;
    text-align: center;
    border-radius: 10px;
    margin: 2px 3px;
    padding: 3px;
    transition: background-color .2s;
  }
`;