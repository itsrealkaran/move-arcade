import { createGlobalStyle } from "styled-components";
import styles from "./";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
    font-size: 16px;
  }

  body {
    margin: 0;
    padding: 0;
    background: ${styles.colors["green-100"]} ;
  }

  a {
    border: 0;
    background: transparent;
    color: ${styles.colors.brown};
    font-size: 1.25rem;
    transition: transform ${styles.transitions.default};
    transform: scaleX(1);

    &:hover {
      transform: scaleX(1.1);
    }
  }
`;

export default GlobalStyle;
