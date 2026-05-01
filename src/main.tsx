import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HomeProvider } from './context/HomeContext.tsx'
import { ConfigProvider } from './context/ConfigContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomeProvider>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </HomeProvider>
  </StrictMode>,
)
