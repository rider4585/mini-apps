import React from "react";
import ReactDOM from "react-dom/client";
import WidgetDsrApp from "./WidgetDsrApp";
import "@shared/styles/index.css";

// Widget Web JS-Widget title function
window.__wweb2JsWidgetTitle = () => "Daily Status Report";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WidgetDsrApp />
  </React.StrictMode>
);
