import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  :root {
    --bg-color              : #252525;
    --primary-color         : #3b5998;
    --card-primary-color    : #3C58aa;
    --card-secondary-color  : #3b5998;
    --button-color          : #3FCA87;
    --text-color            : #f2f5f9;
    --error-color           : #923535;

    font-size: 62.5%;
  }

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    text-decoration: none;
  }

  html,
  body {
    width: 90vw;
    max-width: 1100px;
    margin: 0 auto;
  }

  body,
  input,
  button,
  textarea,
  p, a {
    outline: none;
    font-family: 'Roboto Slab', serif;
    font-size: 1.6rem;
    font-weight: 400;
    color: var(--text-color);
  }

  a {
    font-weight: 500;
  }

  button {
    cursor: pointer;
  }

  h1 {
    font-family: 'Roboto Slab', serif;
    font-size: 2.5rem;
    font-weight: 500;
    color: var(--text-color);
  }

  h2, h3, h4, h5, h6 {
    font-family: 'Roboto Slab', serif;
    color: var(--text-color);
  }

  body {
    -webkit-font-smoothing: antialiased;
    background: var(--bg-color);
  }
`;
