import React from "react";
import ReactDOM from "react-dom";
import { registerMicroApps, start } from "qiankun";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("container"));

registerMicroApps([
  {
    name: "ReactMicroApp",
    entry: "//localhost:4000",
    container: "#container",
    activeRule: "/list",
  },
]);

start();
