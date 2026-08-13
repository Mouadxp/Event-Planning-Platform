import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token')
    if (!t) return null
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      return { email: payload.email ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] }
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    const payload = JSON.parse(atob(data.token.split('.')[1]))
    setUser({ email: payload.email ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] })
  }, [])

  const register = useCallback(async (email, password) => {
    const data = await api.register({ email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    const payload = JSON.parse(atob(data.token.split('.')[1]))
    setUser({ email: payload.email ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] })
  }, [])

  const logout = useCallback(() => {
    api.logout().catch(() => {})
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
