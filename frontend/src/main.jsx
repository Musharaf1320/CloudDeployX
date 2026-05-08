import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

globalThis.React = React;
window.React = React;

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);