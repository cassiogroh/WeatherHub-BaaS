import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 3.4rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--primary-color);
  transition: filter .2s;

  &:hover {
    filter: brightness(113%);
  }

  label {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 12px;
    cursor: pointer;

    p {
      margin: 0;
      font-weight: 600;
    }
  }

  select {
    appearance: none;
    -webkit-appearance: none;
    border: 0;
    background: transparent;
    color: #fff;
    font: inherit;
    cursor: pointer;
    padding-right: 20px;
    max-width: 200px;
    text-overflow: ellipsis;

    option,
    optgroup {
      color: #fff;
      background-color: var(--primary-color);
    }
  }

  // Chevron replacing the native select arrow
  label > svg:last-child {
    position: absolute;
    right: 10px;
    pointer-events: none;
  }

  button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    border: 0;
    border-left: 1px solid #fff3;
    background-color: rgba(0, 0, 0, 0.15);
    color: #fff;
    cursor: pointer;
    transition: background-color .2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }

  // Full width row on mobile: the select takes the remaining space
  @media (max-width: 900px) {
    label {
      flex: 1;
      min-width: 0;
    }

    select {
      flex: 1;
      min-width: 0;
      max-width: none;
    }
  }

  @media (max-width: 400px) {
    label p,
    button span {
      display: none;
    }
  }
`;
