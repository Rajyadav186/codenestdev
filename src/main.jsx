// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(30,41,59,0.95)',
              color: '#F1F5F9',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#F1F5F9' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
