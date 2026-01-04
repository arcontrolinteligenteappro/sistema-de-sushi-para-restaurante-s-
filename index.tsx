
import React from "react";
// FIX: Updated to use createRoot from react-dom/client for React 18, which replaces the deprecated ReactDOM.render.
import { createRoot } from "react-dom/client";
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);