import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { purple, green } from "@material-ui/core/colors";
import { Paper } from "@material-ui/core";

const theme = createMuiTheme({

  typography: {
    fontFamily: [
      "Ubuntu",
      "Condensed",
    ].join(','),
  },
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: green[500],
    },
    background: { paper: "#000000", default: "#000000" },
    type: "dark",
  },
});

ReactDOM.render(
  // <React.StrictMode>
  <ThemeProvider theme={theme}>
    <Paper style={{ height: "100%" }}>
      <App />
    </Paper>
  </ThemeProvider>,

  // </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
