import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorAlert } from '../components/ui'

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(`/${user.role}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl mb-4">
            <span className="text-2xl">🏥</span>
          </div>
          <div className="font-display text-4xl font-extrabold text-primary tracking-tight">
            Afya<span className="text-white"> HMS</span>
          </div>
          <p className="text-muted text-sm mt-1">Hospital Management System</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="font-display text-xl font-bold mb-1">Staff Sign In</h2>
          <p className="text-muted text-sm mb-6">Access is restricted to authorised personnel only.</p>

          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" required placeholder="you@afya.co" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors"/>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Password</label>
              <input type="password" required placeholder="••••••••" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-bg font-semibold rounded-lg py-2.5 text-sm hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted text-center mb-3">Demo accounts</p>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { role: 'Admin',  email: 'admin@afya.co',  color: 'text-primary' },
                { role: 'Doctor', email: 'doctor@afya.co', color: 'text-green'   },
              ].map(({ role, email, color }) => (
                <div key={role} className="bg-surface2 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className={`${color} font-semibold`}>{role}</span>
                  <span className="text-muted">{email}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted text-center mt-2">Password: <span className="text-white">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}