import { createContext, useContext, useMemo, useState } from 'react'
import { getSessionUser, loginUser, logoutUser, registerUser } from './authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSessionUser())

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (credentials) => {
        const next = loginUser(credentials)
        setUser(next)
        return next
      },
      register: async (payload) => {
        const next = registerUser(payload)
        setUser(next)
        return next
      },
      logout: () => {
        logoutUser()
        setUser(null)
      },
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
