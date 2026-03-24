import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin',             icon: '⊞',  label: 'Dashboard'   },
  { to: '/admin/doctors',     icon: '👨‍⚕️', label: 'Doctors'     },
  { to: '/admin/patients',    icon: '🏥',  label: 'Patients'    },
  { to: '/admin/departments', icon: '🏢',  label: 'Departments' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="w-60 min-h-screen bg-surface border-r border-border fixed top-0 left-0 bottom-0 flex flex-col px-4 py-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏥</span>
          <span className="font-display text-xl font-extrabold text-primary">Afya<span className="text-white"> HMS</span></span>
        </div>
        <p className="text-[11px] text-muted uppercase tracking-widest mb-2">Admin Panel</p>
        <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md w-fit mb-7">ADMIN</div>

        <p className="text-[10px] text-muted uppercase tracking-widest mb-2 pl-3">Menu</p>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all no-underline
              ${isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface2 hover:text-white'}`}>
            <span className="text-lg w-5 text-center">{icon}</span>{label}
          </NavLink>
        ))}

        <div className="mt-auto pt-4 border-t border-border">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-muted mb-3">{user?.email}</p>
          <button onClick={logout} className="text-xs text-red hover:text-red/80 transition-colors cursor-pointer">Sign out →</button>
        </div>
      </aside>
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  )
}