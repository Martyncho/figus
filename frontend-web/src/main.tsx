import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Disable StrictMode to prevent double-mounting which can interfere with session recovery
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
