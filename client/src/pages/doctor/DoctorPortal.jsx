import { useState, useEffect, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Avatar, Badge, Button, Modal, FormField, Input, Select, Textarea, Table, Tr, Td, PageHeader, SearchBar, StatCard, ErrorAlert, Spinner } from '../../components/UI'

/* ── Doctor Layout ────────────────────────────────────── */
function DoctorLayout({ children }) {
  const { user, logout } = useAuth()
  const NAV = [
    { to: '/doctor',          icon: '⊞',  label: 'Dashboard' },
    { to: '/doctor/patients', icon: '🏥',  label: 'My Patients' },
  ]
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="w-60 min-h-screen bg-surface border-r border-border fixed top-0 left-0 bottom-0 flex flex-col px-4 py-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏥</span>
          <span className="font-display text-xl font-extrabold text-primary">Afya<span className="text-white"> HMS</span></span>
        </div>
        <p className="text-[11px] text-muted uppercase tracking-widest mb-2">Doctor Portal</p>
        <div className="bg-green/10 text-green text-xs font-semibold px-2 py-1 rounded-md w-fit mb-7">DOCTOR</div>
        <p className="text-[10px] text-muted uppercase tracking-widest mb-2 pl-3">Menu</p>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to==='/doctor'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all no-underline
              ${isActive ? 'bg-green/10 text-green' : 'text-muted hover:bg-surface2 hover:text-white'}`}>
            <span className="text-lg w-5 text-center">{icon}</span>{label}
          </NavLink>
        ))}
        <div className="mt-auto pt-4 border-t border-border">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-muted mb-1">{user?.email}</p>
          <p className="text-xs text-primary mb-3">{user?.doctorProfile?.specialization||''}</p>
          <button onClick={logout} className="text-xs text-red hover:text-red/80 transition-colors cursor-pointer">Sign out →</button>
        </div>
      </aside>
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  )
}

/* ── Doctor Dashboard ─────────────────────────────────── */
export function DoctorDashboard() {
  const { user, doctorProfile } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.getPatients().then(setPatients).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const active   = patients.filter(p => p.status === 'Active').length
  const thisWeek = patients.filter(p => new Date(p.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length

  return (
    <DoctorLayout>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-extrabold">Welcome, {user?.name?.split(' ').slice(0,2).join(' ')} 👋</h1>
        <p className="text-muted text-sm mt-1">{doctorProfile?.specialization} · {doctorProfile?.department_name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-7">
        <StatCard icon="🏥" value={patients.length} label="Total patients"       color="green"   />
        <StatCard icon="✅" value={active}           label="Active patients"      color="primary" />
        <StatCard icon="📅" value={thisWeek}         label="Added this week"      color="yellow"  />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border font-display font-bold text-sm">Recent Patients</div>
        <table className="w-full">
          <thead className="bg-surface2"><tr>{['Patient','Age','Blood Type','Status','Added'].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-muted font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {patients.slice(0,6).map((p,i) => (
              <tr key={p.id} className="hover:bg-surface2 border-b border-border last:border-0">
                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={p.name} index={i}/><div><p className="text-sm font-medium">{p.name}</p><p className="text-[11px] text-muted">{p.patient_id}</p></div></div></td>
                <td className="px-4 py-3 text-sm text-muted">{p.age} yrs</td>
                <td className="px-4 py-3"><Badge color="purple">{p.blood_type||'—'}</Badge></td>
                <td className="px-4 py-3"><Badge color={p.status==='Active'?'green':'yellow'}>{p.status}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {patients.length===0&&<tr><td colSpan={5} className="px-4 py-8 text-center text-muted text-sm">No patients yet — add your first patient!</td></tr>}
          </tbody>
        </table>
      </div>
    </DoctorLayout>
  )
}

/* ── Patient form blank ───────────────────────────────── */
const P_BLANK = { name:'', age:'', gender:'Male', phone:'', email:'', blood_type:'', allergies:'', status:'Active' }

/* ── Doctor Patients Page ─────────────────────────────── */
export function DoctorPatients() {
  const [patients, setPatients] = useState([])
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null) // 'add' | patient obj | 'detail'
  const [selected, setSelected] = useState(null)
  const [detail,   setDetail]   = useState(null)
  const [form,     setForm]     = useState(P_BLANK)
  const [error,    setError]    = useState('')
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { api.getPatients().then(setPatients).catch(console.error) }, [])

  const filtered = useMemo(() =>
    patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.patient_id?.includes(search))
  , [patients, search])

  const openAdd  = () => { setForm(P_BLANK); setError(''); setModal('add') }
  const openEdit = p => { setForm({ name:p.name, age:p.age, gender:p.gender, phone:p.phone||'', email:p.email||'', blood_type:p.blood_type||'', allergies:p.allergies||'', status:p.status }); setError(''); setModal(p) }

  const viewPatient = async p => {
    setSelected(p); setDetail(null); setModal('detail')
    const full = await api.getPatient(p.id)
    setDetail(full)
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'add') { const p = await api.createPatient(form); setPatients(prev => [p, ...prev]) }
      else { const p = await api.updatePatient(modal.id, form); setPatients(prev => prev.map(x => x.id===modal.id?{...x,...p}:x)) }
      setModal(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <DoctorLayout>
      <PageHeader title="My Patients" sub={`${patients.length} patients · records cannot be deleted`}
        action={<Button onClick={openAdd}>+ Add Patient</Button>} />

      <div className="flex gap-2.5 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patients…" />
      </div>

      <Table headers={['Patient','Age','Gender','Blood Type','Allergies','Status','Actions']}
        isEmpty={filtered.length===0} emptyIcon="🏥" emptyMessage="No patients yet">
        {filtered.map((p, i) => (
          <Tr key={p.id}>
            <Td><div className="flex items-center gap-2.5"><Avatar name={p.name} index={i}/>
              <div><p className="font-medium">{p.name}</p><p className="text-[11px] text-muted">{p.patient_id}</p></div>
            </div></Td>
            <Td>{p.age} yrs</Td>
            <Td>{p.gender}</Td>
            <Td><Badge color="purple">{p.blood_type||'—'}</Badge></Td>
            <Td className="text-muted text-xs max-w-[120px] truncate">{p.allergies||'None'}</Td>
            <Td><Badge color={p.status==='Active'?'green':'yellow'}>{p.status}</Badge></Td>
            <Td><div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => viewPatient(p)}>View</Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button>
            </div></Td>
          </Tr>
        ))}
      </Table>

      {/* Add / Edit Modal */}
      {(modal === 'add' || (modal && modal !== 'detail')) && (
        <Modal title={modal==='add'?'Add Patient':'Edit Patient'} onClose={() => setModal(null)}>
          <ErrorAlert message={error} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name"><Input value={form.name} onChange={set('name')} /></FormField>
            <FormField label="Age"><Input type="number" value={form.age} onChange={set('age')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Gender"><Select value={form.gender} onChange={set('gender')}><option>Male</option><option>Female</option><option>Other</option></Select></FormField>
            <FormField label="Blood Type"><Select value={form.blood_type} onChange={set('blood_type')}>
              <option value="">Unknown</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
            </Select></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone"><Input value={form.phone} onChange={set('phone')} placeholder="+254…"/></FormField>
            <FormField label="Email"><Input type="email" value={form.email} onChange={set('email')} /></FormField>
          </div>
          <FormField label="Allergies"><Textarea value={form.allergies} onChange={set('allergies')} placeholder="List any known allergies…"/></FormField>
          <FormField label="Status"><Select value={form.status} onChange={set('status')}><option>Active</option><option>Inactive</option></Select></FormField>
          <div className="flex justify-end gap-2.5 mt-6">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving?'Saving…':'Save Patient'}</Button>
          </div>
        </Modal>
      )}

      {/* Patient Detail Modal */}
      {modal === 'detail' && selected && (
        <PatientDetailModal patient={selected} detail={detail} onClose={() => { setModal(null); setSelected(null); setDetail(null) }}
          onRefresh={async () => { const full = await api.getPatient(selected.id); setDetail(full) }} />
      )}
    </DoctorLayout>
  )
}

/* ── Patient Detail Modal ─────────────────────────────── */
function PatientDetailModal({ patient, detail, onClose, onRefresh }) {
  const [tab,          setTab]          = useState('info')
  const [diagModal,    setDiagModal]    = useState(null)
  const [presModal,    setPresModal]    = useState(null)
  const [diagForm,     setDiagForm]     = useState({ symptoms:'', diagnosis:'', notes:'', visit_date: new Date().toISOString().split('T')[0] })
  const [presForm,     setPresForm]     = useState({ medication:'', dosage:'', frequency:'', duration:'', notes:'' })
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  const saveDiag = async () => {
    setSaving(true); setError('')
    try {
      if (diagModal === 'add') await api.createDiagnosis(patient.id, diagForm)
      else await api.updateDiagnosis(patient.id, diagModal.id, diagForm)
      await onRefresh(); setDiagModal(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const savePres = async () => {
    setSaving(true); setError('')
    try {
      if (presModal === 'add') await api.createPrescription(patient.id, presForm)
      else await api.updatePrescription(patient.id, presModal.id, presForm)
      await onRefresh(); setPresModal(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const dset = k => e => setDiagForm(p => ({ ...p, [k]: e.target.value }))
  const pset = k => e => setPresForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Modal title={patient.name} onClose={onClose} wide>
      {/* Tabs */}
      <div className="flex gap-1 bg-surface2 p-1 rounded-lg mb-5 w-fit">
        {['info','diagnoses','prescriptions'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all cursor-pointer
            ${tab===t ? 'bg-surface text-white' : 'text-muted hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {!detail ? <div className="text-center py-8 text-muted">Loading…</div> : (
        <>
          {/* Info tab */}
          {tab === 'info' && (
            <div className="grid grid-cols-3 gap-3">
              {[['Patient ID',detail.patient_id],['Age',`${detail.age} yrs`],['Gender',detail.gender],
                ['Phone',detail.phone||'—'],['Email',detail.email||'—'],['Blood Type',detail.blood_type||'—'],
                ['Status',detail.status],['Registered',new Date(detail.created_at).toLocaleDateString()],
                ['Last Updated',new Date(detail.updated_at).toLocaleDateString()],
              ].map(([l,v]) => (
                <div key={l} className="bg-surface2 rounded-lg p-3">
                  <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{l}</p>
                  <p className="text-sm font-medium">{v}</p>
                </div>
              ))}
              {detail.allergies && (
                <div className="col-span-3 bg-red/10 border border-red/20 rounded-lg p-3">
                  <p className="text-[10px] text-red uppercase tracking-wide mb-0.5">⚠️ Allergies</p>
                  <p className="text-sm text-red">{detail.allergies}</p>
                </div>
              )}
            </div>
          )}

          {/* Diagnoses tab */}
          {tab === 'diagnoses' && (
            <div>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => { setDiagForm({ symptoms:'', diagnosis:'', notes:'', visit_date: new Date().toISOString().split('T')[0] }); setDiagModal('add') }}>+ Add Diagnosis</Button>
              </div>
              {detail.diagnoses?.length === 0
                ? <p className="text-muted text-sm text-center py-8">No diagnoses recorded yet.</p>
                : detail.diagnoses?.map(d => (
                  <div key={d.id} className="bg-surface2 border border-border rounded-lg p-4 mb-2">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold">{d.diagnosis}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{new Date(d.visit_date).toLocaleDateString()}</span>
                        <Button variant="ghost" size="sm" onClick={() => { setDiagForm({ symptoms:d.symptoms, diagnosis:d.diagnosis, notes:d.notes||'', visit_date:d.visit_date?.split('T')[0] }); setDiagModal(d) }}>Edit</Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted"><span className="text-white">Symptoms:</span> {d.symptoms}</p>
                    {d.notes && <p className="text-xs text-muted mt-1"><span className="text-white">Notes:</span> {d.notes}</p>}
                  </div>
                ))}

              {diagModal && (
                <Modal title={diagModal==='add'?'Add Diagnosis':'Edit Diagnosis'} onClose={() => setDiagModal(null)}>
                  <ErrorAlert message={error} />
                  <FormField label="Visit Date"><Input type="date" value={diagForm.visit_date} onChange={dset('visit_date')} /></FormField>
                  <FormField label="Symptoms"><Textarea value={diagForm.symptoms} onChange={dset('symptoms')} placeholder="Patient-reported symptoms…"/></FormField>
                  <FormField label="Diagnosis"><Textarea value={diagForm.diagnosis} onChange={dset('diagnosis')} placeholder="Clinical diagnosis…"/></FormField>
                  <FormField label="Notes"><Textarea value={diagForm.notes} onChange={dset('notes')} placeholder="Additional notes…"/></FormField>
                  <div className="flex justify-end gap-2.5 mt-6">
                    <Button variant="ghost" onClick={() => setDiagModal(null)}>Cancel</Button>
                    <Button onClick={saveDiag} disabled={saving}>{saving?'Saving…':'Save'}</Button>
                  </div>
                </Modal>
              )}
            </div>
          )}

          {/* Prescriptions tab */}
          {tab === 'prescriptions' && (
            <div>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => { setPresForm({ medication:'', dosage:'', frequency:'', duration:'', notes:'' }); setPresModal('add') }}>+ Add Prescription</Button>
              </div>
              {detail.prescriptions?.length === 0
                ? <p className="text-muted text-sm text-center py-8">No prescriptions recorded yet.</p>
                : detail.prescriptions?.map(p => (
                  <div key={p.id} className="bg-surface2 border border-border rounded-lg p-4 mb-2">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold">{p.medication}</p>
                      <Button variant="ghost" size="sm" onClick={() => { setPresForm({ medication:p.medication, dosage:p.dosage||'', frequency:p.frequency||'', duration:p.duration||'', notes:p.notes||'' }); setPresModal(p) }}>Edit</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                      <span><span className="text-white">Dosage:</span> {p.dosage||'—'}</span>
                      <span><span className="text-white">Frequency:</span> {p.frequency||'—'}</span>
                      <span><span className="text-white">Duration:</span> {p.duration||'—'}</span>
                    </div>
                    {p.notes && <p className="text-xs text-muted mt-1"><span className="text-white">Notes:</span> {p.notes}</p>}
                  </div>
                ))}

              {presModal && (
                <Modal title={presModal==='add'?'Add Prescription':'Edit Prescription'} onClose={() => setPresModal(null)}>
                  <ErrorAlert message={error} />
                  <FormField label="Medication"><Input value={presForm.medication} onChange={pset('medication')} placeholder="e.g. Amoxicillin 500mg"/></FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Dosage"><Input value={presForm.dosage} onChange={pset('dosage')} placeholder="e.g. 1 tablet"/></FormField>
                    <FormField label="Frequency"><Input value={presForm.frequency} onChange={pset('frequency')} placeholder="e.g. 3x daily"/></FormField>
                  </div>
                  <FormField label="Duration"><Input value={presForm.duration} onChange={pset('duration')} placeholder="e.g. 7 days"/></FormField>
                  <FormField label="Notes"><Textarea value={presForm.notes} onChange={pset('notes')} placeholder="Additional instructions…"/></FormField>
                  <div className="flex justify-end gap-2.5 mt-6">
                    <Button variant="ghost" onClick={() => setPresModal(null)}>Cancel</Button>
                    <Button onClick={savePres} disabled={saving}>{saving?'Saving…':'Save'}</Button>
                  </div>
                </Modal>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}