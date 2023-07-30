import styled from 'styled-components';

export const Container = styled.div`
  padding-bottom: 50px;
`;

export const InfoIds = styled.div`
  width: 100%;
  background-color: var(--primary-color);
  border-radius: 10px;
  padding: 10px;
  transition: filter .3s;
  margin-bottom: 10px;

  &:hover {
    filter: brightness(113%);
  }

  h3 {
    font-weight: 400;
    text-align: center;
    background: rgba(0,0,0, 0.2);
    width: 100%;
    border-radius: 10px;
  }

  p {
    margin-top: 5px;
    margin-bottom: 20px;
    text-align: justify;
    text-justify: inter-word;

    a {
      text-decoration: underline;
    }
  }
`;

export const InfoContainer = styled.main`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 10px;

  margin-bottom: 20px;

  div {
    width: 100%;
    background-color: var(--primary-color);
    border-radius: 10px;
    padding: 10px;
    transition: filter .3s;

    &:hover {
      filter: brightness(113%);
    }

    h3 {
      font-weight: 400;
      text-align: center;
      background: rgba(0,0,0, 0.2);
      width: 100%;
      border-radius: 10px;
    }

    p {
      margin-top: 5px;
      margin-bottom: 20px;
      text-align: justify;
      text-justify: inter-word;
    }
  }
`;