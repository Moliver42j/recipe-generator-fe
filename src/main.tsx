import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HomeProvider } from './context/HomeContext.tsx'
import { ConfigProvider } from './context/ConfigContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { FavouritesProvider } from './context/FavouritesContext.tsx'
import { AccountSyncProvider } from './context/AccountSyncContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomeProvider>
      <ConfigProvider>
        <FavouritesProvider>
          <AuthProvider>
            <AccountSyncProvider>
              <App />
            </AccountSyncProvider>
          </AuthProvider>
        </FavouritesProvider>
      </ConfigProvider>
    </HomeProvider>
  </StrictMode>,
)
