import styled from 'styled-components';

export const Container = styled.div`
  padding-top: 70px;
  padding-bottom: 50px;
`;

export const AskLocation = styled.div`
  text-align: center;
  padding-top: 100px;

  h2 {
    font-weight: 400;
  }
`;

export const ForecastTodayContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-radius: 10px;
  background-color: var(--primary-color);
  margin-bottom: 1rem;
  padding: 3px;
  width: 100%;
  transition: filter .3s;

  &:hover {
    filter: brightness(113%);
  }

  @media (max-width: 800px) {
    flex-direction: column;

    img {
      height: 120px;
      width: 120px;
    }
  }

  img {
    height: 150px;
    width: 150px;
  }

  main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    margin: 3px;

    div {
      display: flex;
      justify-content: center;
      flex-direction: column;

      background-color: rgba(0,0,0, 0.2);
      padding: 3px;
      border-radius: 10px;
      width: 100%;
      height: 150px;

      p {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 10px;
        margin: 0 3px;
        padding: 1px;
        overflow: hidden;
        font-size: 1.4rem;
        text-align: justify;
        text-justify: inter-word;
        transition: background-color .3s;

        &:hover {
          background: rgba(0,0,0, 0.1);
        }
      }
    }
  }

  footer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    margin: 3px;

    div {
      display: flex;
      justify-content: center;
      flex-direction: column;

      background-color: rgba(0,0,0, 0.2);
      border-radius: 10px;
      width: 100%;
      height: 150px;

      p {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 10px;
        margin: 0 3px;
        padding: 1px;
        font-size: 1.4rem;
        transition: background-color .3s;

        &:hover {
          background: rgba(0,0,0, 0.1);
        }
      }
    }
  }
`;

export const DaylyForecastContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
`;