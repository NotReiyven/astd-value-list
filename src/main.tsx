import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./app/App.tsx";
import './styles/index.css'
import { UnitProvider } from './context/UnitContext'
import { TradeProvider } from './context/TradeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnitProvider>
      <TradeProvider>
        <App />
      </TradeProvider>
    </UnitProvider>
  </React.StrictMode>,
)