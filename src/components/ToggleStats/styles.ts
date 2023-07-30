import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  position: relative;
  margin: 20px 0;

  p {
    margin-left: auto;
  }

  @media (max-width: 900px) {
    margin: 30px 0 10px 0;

    p {
      margin-left: initial;
    }
  }
`;

export const OptionsHeader = styled.header`
  display: flex;
  justify-content: space-around;
  align-items: center;

  padding: 5px 2px;
  margin: 0 5px 5px;
  background-color: rgba(0,0,0, 0.2);
  border-radius: 5px;

  p {
    background: none;
    margin: 0;
    padding: 0 ;
  }

  div {
    position: relative;
    display: inline-block;
    width: 47px;
    height: 26px;
  }

  div input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  div span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #FFF;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 34px;
  }

  div span:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: var(--primary-color);
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
  }

  div input:checked + span:before {
    -webkit-transform: translateX(20px);
    -ms-transform: translateX(20px);
    transform: translateX(20px);
  }
`;

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -10px;
  padding-bottom: 10px;

  position: absolute;
  z-index: 2;
  overflow: hidden;

  border: 2px solid var(--primary-color);
  border-radius: 8px;
  background-color: var(--primary-color);

  max-height: 3.4rem;
  transition: max-height .2s ease-out, border-color .3s, filter .2s;

  &:hover {
    max-height: 430px;
    border-color: #fff;
    filter: brightness(113%);
    transition: max-height .2s ease-in;

    > p:first-child {
      background-color: rgba(0,0,0, 0.2);
    }
  }

  > p:first-child {
    padding: 5px;
    margin-bottom: 10px;
    border-radius: 8px 8px 0 0;
  }

  @media (max-width: 900px) {
    top: -28px;
  }
`;

interface HistoricProps {
  minStatus: boolean;
  medStatus: boolean;
  maxStatus: boolean;
  toggleInputSlider: boolean;
}

export const HistoricOptions = styled.div<HistoricProps>`
  flex-direction: column;
  margin: 0 3px 5px;
  transition: opacity .3s, visibility .3s;
  opacity: 0;
  display: none;

  ${props => props.toggleInputSlider && css`opacity: 1; display: flex;`};

  div:first-child {
    display: flex;
    justify-content: space-between;
  }

  div:first-child p {
    margin: 0 2px;
    padding: 4px;
    border-radius: 5px;
    background-color: rgba(0,0,0, 0.07);
    cursor: pointer;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  div:first-child p:first-child {
    ${props => props.minStatus && css`background-color: rgba(0,0,0, 0.2)`}
  }

  div:first-child p:first-child + p {
    ${props => props.medStatus && css`background-color: rgba(0,0,0, 0.2)`}
  }

  div:first-child p:last-child {
    ${props => props.maxStatus && css`background-color: rgba(0,0,0, 0.2)`}
  }

  div + div {
    margin-top: 5px;
    display: flex;
    justify-content: center;
    align-items: center;

    p {
      margin: 0;
      cursor: default;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
        user-select: none;
    }

    svg {
      margin: 0 10px;
      cursor: pointer;
    }
  }
  
`;

export const ExclusiveButton = styled.button`
  padding: 5px;
  border-radius: 10px;
  background-color: rgba(0,0,0, 0.2);
  color: #FFF;
  width: fit-content;
  margin: 5px auto;
  border: 0;
  transition: background-color .2s;

  &:hover {
    background-color: rgba(0,0,0, 0.4);
  }
`;

export const AddStationForm = styled.form`
  display: flex;
  margin-top: -10px;
  left: 197px;

  position: absolute;
  z-index: 2;

  input {
    border: 0;
    border-radius: 8px 0 0 8px;
    color: #fff;
    background-color: #3b5998;
    height: 3.4rem;
    padding: 10px;
    width: 150px;

    &::placeholder {
      color: #AAA;
    }
  }

  button {
    height: 3.4rem;
    width: 3.4rem;
    border-radius: 0 8px 8px 0;
    border: 0;
    background: #EEE;

    display: flex;
    justify-content: center;
    align-items: center;

    transition: background-color .2s, box-shadow .2s;
    
    &:hover {
      background-color: #fff;
      box-shadow: 0 0 5px #FFF;
    }
  }

  @media (max-width: 900px) {
    top: -28px;

    input {
      width: 130px;
    }
  }
`;

