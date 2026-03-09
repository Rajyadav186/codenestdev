// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

// Route guard for authenticated users
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

// Route guard for admin only
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0f1e', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{
        width: 48, height: 48, border: '3px solid rgba(37,99,235,0.2)',
        borderTop: '3px solid #2563EB', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}/>
      <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: "'DM Sans',sans-serif" }}>
        Loading...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      }/>
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      }/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
