import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

function decodeUserFromToken(token) {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const email = payload.email ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    const rawRoles =
      payload.role ??
      payload.roles ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

    const roles = Array.isArray(rawRoles)
      ? rawRoles
      : rawRoles
        ? [rawRoles]
        : []

    return {
      email,
      roles,
      isAdmin: roles.includes('Admin'),
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => decodeUserFromToken(localStorage.getItem('token')))

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(decodeUserFromToken(data.token))
  }, [])

  const register = useCallback(async (email, password) => {
    const data = await api.register({ email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(decodeUserFromToken(data.token))
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
