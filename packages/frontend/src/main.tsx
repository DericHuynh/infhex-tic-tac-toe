import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

let root = document.getElementById('root');
if (!root) {
  console.error("Missing DOM root. Using body.");
  root = document.body;
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
