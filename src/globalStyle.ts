import { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: scroll;
  }

  p {
    margin: 8px 0;
  }

  a {
    text-decoration: none;
  }

  div {
    box-sizing: border-box;
  }

  sup {
    line-height: 0;
}

  * {
    font-family: 'Helvetica', 'Arial', sans-serif;
  }
`
