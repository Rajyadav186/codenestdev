// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange, getUserProfile, logoutUser } from '../firebase/services'

const AuthContext = createContext(null)

// ADMIN_UID — after first admin login, check Firebase console
// Authentication → Users → copy the admin user's UID
// Then paste it here AND in Firebase custom claims (or use email check for simplicity)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'rajy41008@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const prof = await getUserProfile(firebaseUser.uid)
        setProfile(prof)
        // Admin check — by email (simplest approach)
        setIsAdmin(firebaseUser.email === ADMIN_EMAIL)
      } else {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
      }
    })
    return unsub
  }, [])

  const logout = async () => {
    await logoutUser()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading: user === undefined, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
