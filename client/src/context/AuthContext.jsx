import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(null)
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('afya_token')
    if (token) {
      api.me()
        .then(({ user, doctorProfile }) => { setUser(user); setDoctorProfile(doctorProfile) })
        .catch(() => localStorage.removeItem('afya_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { user, doctorProfile, token } = await api.login({ email, password })
    localStorage.setItem('afya_token', token)
    setUser(user)
    setDoctorProfile(doctorProfile)
    return user
  }

  const logout = () => {
    localStorage.removeItem('afya_token')
    setUser(null)
    setDoctorProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, doctorProfile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)