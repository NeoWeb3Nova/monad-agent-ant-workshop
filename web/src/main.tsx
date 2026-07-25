import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './visual-assets.css'
import './image-assets.css'
import App from './App.tsx'
import { Providers } from './Providers.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
