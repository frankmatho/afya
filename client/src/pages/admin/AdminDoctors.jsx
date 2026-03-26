import { useState, useEffect, useMemo } from 'react'
import { api } from '../../api/client'
import AdminLayout from './AdminLayout'
import { Avatar, Badge, Button, Modal, FormField, Input, Select, Table, Tr, Td, PageHeader, SearchBar, ErrorAlert } from '../../components/UI'

const BLANK = { name: '', email: '', password: '', specialization: '', department_id: '', phone: '', status: 'Active' }

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [deps,    setDeps]    = useState([])
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('All')
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState(BLANK)
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    Promise.all([api.getDoctors(), api.getDepartments()])
      .then(([d, dep]) => { setDoctors(d); setDeps(dep) }).catch(console.error)
  }, [])

  const filtered = useMemo(() =>
    doctors.filter(d =>
      (filter === 'All' || d.status === filter) &&
      (d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase()))
    ), [doctors, search, filter])

  const openAdd  = () => { setForm(BLANK); setError(''); setModal('add') }
  const openEdit = (d) => { setForm({ name: d.name, email: d.email, password: '', specialization: d.specialization, department_id: d.department_id, phone: d.phone, status: d.status }); setError(''); setModal(d) }

  const save = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'add') {
        const d = await api.createDoctor(form)
        setDoctors(p => [d, ...p])
      } else {
        const d = await api.updateDoctor(modal.id, form)
        setDoctors(p => p.map(x => x.id === modal.id ? { ...x, ...d, name: form.name, email: form.email } : x))
      }
      setModal(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const toggleStatus = async (doctor) => {
    const newStatus = doctor.status === 'Active' ? 'Inactive' : 'Active'
    await api.toggleStatus(doctor.id, { status: newStatus })
    setDoctors(p => p.map(d => d.id === doctor.id ? { ...d, status: newStatus } : d))
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <AdminLayout>
      <PageHeader title="Doctors" sub={`${doctors.length} registered · ${doctors.filter(d=>d.status==='Active').length} active`}
        action={<Button onClick={openAdd}>+ Add Doctor</Button>} />

      <div className="flex gap-2.5 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search doctors…" />
        <select className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer"
          value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option><option>Active</option><option>Inactive</option>
        </select>
      </div>

      <Table headers={['Doctor','Specialization','Department','Phone','Status','Actions']}
        isEmpty={filtered.length===0} emptyIcon="👨‍⚕️" emptyMessage="No doctors found">
        {filtered.map((d, i) => (
          <Tr key={d.id}>
            <Td><div className="flex items-center gap-2.5"><Avatar name={d.name} index={i}/>
              <div><p className="font-medium">{d.name}</p><p className="text-[11px] text-muted">{d.doctor_id} · {d.email}</p></div>
            </div></Td>
            <Td><Badge color="blue">{d.specialization||'—'}</Badge></Td>
            <Td className="text-muted text-xs">{d.department_name||'—'}</Td>
            <Td className="text-muted text-xs">{d.phone||'—'}</Td>
            <Td><Badge color={d.status==='Active'?'green':'red'}>{d.status}</Badge></Td>
            <Td><div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>Edit</Button>
              <Button variant={d.status==='Active'?'danger':'success'} size="sm" onClick={() => toggleStatus(d)}>
                {d.status==='Active'?'Deactivate':'Activate'}
              </Button>
            </div></Td>
          </Tr>
        ))}
      </Table>

      {modal && (
        <Modal title={modal==='add'?'Add Doctor':'Edit Doctor'} onClose={() => setModal(null)}>
          <ErrorAlert message={error} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name"><Input value={form.name} onChange={set('name')} placeholder="Dr. John Doe"/></FormField>
            <FormField label="Email"><Input type="email" value={form.email} onChange={set('email')} /></FormField>
          </div>
          {modal === 'add' && (
            <FormField label="Password"><Input type="password" value={form.password} onChange={set('password')} placeholder="Set login password"/></FormField>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Specialization"><Input value={form.specialization} onChange={set('specialization')} placeholder="e.g. Cardiologist"/></FormField>
            <FormField label="Department">
              <Select value={form.department_id} onChange={set('department_id')}>
                <option value="">Select department…</option>
                {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone"><Input value={form.phone} onChange={set('phone')} placeholder="+254…"/></FormField>
            {modal !== 'add' && (
              <FormField label="Status">
                <Select value={form.status} onChange={set('status')}>
                  <option>Active</option><option>Inactive</option>
                </Select>
              </FormField>
            )}
          </div>
          <div className="flex justify-end gap-2.5 mt-6">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving?'Saving…':'Save Doctor'}</Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}