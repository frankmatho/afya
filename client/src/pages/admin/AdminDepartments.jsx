import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import AdminLayout from './AdminLayout'
import { Badge, Button, Modal, FormField, Input, Textarea, Table, Tr, Td, PageHeader, ErrorAlert } from '../../components/ui'

const BLANK = { name: '', description: '' }

export default function AdminDepartments() {
  const [deps,   setDeps]   = useState([])
  const [modal,  setModal]  = useState(null)
  const [form,   setForm]   = useState(BLANK)
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { api.getDepartments().then(setDeps).catch(console.error) }, [])

  const openAdd  = () => { setForm(BLANK); setError(''); setModal('add') }
  const openEdit = d => { setForm({ name: d.name, description: d.description||'' }); setError(''); setModal(d) }

  const save = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'add') { const d = await api.createDepartment(form); setDeps(p => [...p, d]) }
      else { const d = await api.updateDepartment(modal.id, form); setDeps(p => p.map(x => x.id===modal.id?d:x)) }
      setModal(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const ICONS = { 'General Medicine':'🩺','Cardiology':'❤️','Pediatrics':'👶','Orthopedics':'🦴','Neurology':'🧠' }

  return (
    <AdminLayout>
      <PageHeader title="Departments" sub={`${deps.length} departments`} action={<Button onClick={openAdd}>+ Add Department</Button>} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {deps.map(d => (
          <div key={d.id} className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{ICONS[d.name] || '🏥'}</span>
              <Badge color="blue">{d.doctor_count} doctors</Badge>
            </div>
            <p className="font-display font-bold text-base mb-1">{d.name}</p>
            <p className="text-xs text-muted mb-4">{d.description||'No description'}</p>
            <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>Edit</Button>
          </div>
        ))}
      </div>

      <Table headers={['Department','Description','Doctors']} isEmpty={deps.length===0} emptyIcon="🏢" emptyMessage="No departments yet">
        {deps.map(d => (
          <Tr key={d.id}>
            <Td className="font-medium">{ICONS[d.name]||'🏥'} {d.name}</Td>
            <Td className="text-muted text-xs">{d.description||'—'}</Td>
            <Td><Badge color="blue">{d.doctor_count} active doctors</Badge></Td>
          </Tr>
        ))}
      </Table>

      {modal && (
        <Modal title={modal==='add'?'Add Department':'Edit Department'} onClose={() => setModal(null)}>
          <ErrorAlert message={error} />
          <FormField label="Department Name"><Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Cardiology"/></FormField>
          <FormField label="Description"><Textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Brief description…"/></FormField>
          <div className="flex justify-end gap-2.5 mt-6">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving?'Saving…':'Save Department'}</Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}