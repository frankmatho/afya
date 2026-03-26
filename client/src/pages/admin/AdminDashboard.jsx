import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import AdminLayout from './AdminLayout'
import { StatCard, Badge, Avatar, Spinner } from '../../components/UI'

export default function AdminDashboard() {
  const [doctors,  setDoctors]  = useState([])
  const [patients, setPatients] = useState([])
  const [deps,     setDeps]     = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([api.getDoctors(), api.getPatients(), api.getDepartments()])
      .then(([d, p, dep]) => { setDoctors(d); setPatients(p); setDeps(dep) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const activeDoctors   = doctors.filter(d => d.status === 'Active').length
  const activePatients  = patients.filter(p => p.status === 'Active').length
  const thisMonth       = patients.filter(p => new Date(p.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Hospital overview — Afya Medical Centre</p>
        </div>
        <div className="text-right text-sm text-muted">
          <p className="text-primary font-bold">{new Date().toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        <StatCard icon="👨‍⚕️" value={doctors.length}  label={`${activeDoctors} active`}       color="primary" />
        <StatCard icon="🏥"  value={patients.length} label={`${activePatients} active`}       color="green"   />
        <StatCard icon="🏢"  value={deps.length}     label="Departments"                       color="purple"  />
        <StatCard icon="📅"  value={thisMonth}       label="New patients this month"           color="yellow"  />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Recent Doctors */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border font-display font-bold text-sm">Recent Doctors</div>
          <table className="w-full">
            <thead className="bg-surface2"><tr>{['Doctor','Specialization','Status'].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-muted font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {doctors.slice(0,5).map((d,i)=>(
                <tr key={d.id} className="hover:bg-surface2 border-b border-border last:border-0">
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={d.name} index={i}/><div><p className="text-sm font-medium">{d.name}</p><p className="text-[11px] text-muted">{d.doctor_id}</p></div></div></td>
                  <td className="px-4 py-3"><Badge color="blue">{d.specialization||'—'}</Badge></td>
                  <td className="px-4 py-3"><Badge color={d.status==='Active'?'green':'red'}>{d.status}</Badge></td>
                </tr>
              ))}
              {doctors.length===0&&<tr><td colSpan={3} className="px-4 py-8 text-center text-muted text-sm">No doctors yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Recent Patients */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border font-display font-bold text-sm">Recent Patients</div>
          <table className="w-full">
            <thead className="bg-surface2"><tr>{['Patient','Doctor','Status'].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-muted font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {patients.slice(0,5).map((p,i)=>(
                <tr key={p.id} className="hover:bg-surface2 border-b border-border last:border-0">
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={p.name} index={i+3}/><div><p className="text-sm font-medium">{p.name}</p><p className="text-[11px] text-muted">{p.patient_id}</p></div></div></td>
                  <td className="px-4 py-3 text-xs text-muted">{p.doctor_name||'—'}</td>
                  <td className="px-4 py-3"><Badge color={p.status==='Active'?'green':'yellow'}>{p.status}</Badge></td>
                </tr>
              ))}
              {patients.length===0&&<tr><td colSpan={3} className="px-4 py-8 text-center text-muted text-sm">No patients yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}