import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('Initializing React App...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('CRITICAL: Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found, mounting...');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);