import { useState, useEffect, useMemo } from 'react'
import { api } from '../../api/client'
import AdminLayout from './AdminLayout'
import { Avatar, Badge, Button, Modal, Table, Tr, Td, PageHeader, SearchBar } from '../../components/ui'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('All')
  const [selected, setSelected] = useState(null)
  const [detail,   setDetail]   = useState(null)

  useEffect(() => { api.getPatients().then(setPatients).catch(console.error) }, [])

  const filtered = useMemo(() =>
    patients.filter(p =>
      (filter==='All'||p.status===filter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.patient_id?.includes(search))
    ), [patients, search, filter])

  const viewPatient = async (p) => {
    setSelected(p)
    const full = await api.getPatient(p.id)
    setDetail(full)
  }

  const bloodColor = bt => ({ 'A+':'green','A-':'green','B+':'blue','B-':'blue','AB+':'purple','AB-':'purple','O+':'yellow','O-':'yellow' }[bt] || 'gray')

  return (
    <AdminLayout>
      <PageHeader title="All Patients" sub={`${patients.length} total records — no records can be deleted`} />

      <div className="flex gap-2.5 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patients…" />
        <select className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer"
          value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option><option>Active</option><option>Inactive</option>
        </select>
      </div>

      <Table headers={['Patient','Age/Gender','Blood Type','Doctor','Status','Action']}
        isEmpty={filtered.length===0} emptyIcon="🏥" emptyMessage="No patients found">
        {filtered.map((p, i) => (
          <Tr key={p.id}>
            <Td><div className="flex items-center gap-2.5"><Avatar name={p.name} index={i}/>
              <div><p className="font-medium">{p.name}</p><p className="text-[11px] text-muted">{p.patient_id}</p></div>
            </div></Td>
            <Td className="text-muted text-xs">{p.age} yrs · {p.gender}</Td>
            <Td><Badge color={bloodColor(p.blood_type)}>{p.blood_type||'—'}</Badge></Td>
            <Td className="text-xs text-muted">{p.doctor_name||'—'}</Td>
            <Td><Badge color={p.status==='Active'?'green':'yellow'}>{p.status}</Badge></Td>
            <Td><Button variant="ghost" size="sm" onClick={() => viewPatient(p)}>View</Button></Td>
          </Tr>
        ))}
      </Table>

      {/* Patient detail modal */}
      {selected && (
        <Modal title={`${selected.name} — Patient Record`} onClose={() => { setSelected(null); setDetail(null) }} wide>
          {!detail ? (
            <div className="text-center py-8 text-muted">Loading record…</div>
          ) : (
            <div className="space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Patient ID', detail.patient_id],
                  ['Age', `${detail.age} years`],
                  ['Gender', detail.gender],
                  ['Phone', detail.phone||'—'],
                  ['Email', detail.email||'—'],
                  ['Blood Type', detail.blood_type||'—'],
                  ['Allergies', detail.allergies||'None'],
                  ['Status', detail.status],
                  ['Doctor', detail.doctor_name||'—'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-surface2 rounded-lg p-3">
                    <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-medium">{val}</p>
                  </div>
                ))}
              </div>

              {/* Diagnoses */}
              <div>
                <p className="font-display font-bold text-sm mb-3">Diagnoses & Visit History</p>
                {detail.diagnoses?.length === 0
                  ? <p className="text-muted text-sm">No diagnoses recorded.</p>
                  : detail.diagnoses?.map(d => (
                    <div key={d.id} className="bg-surface2 border border-border rounded-lg p-4 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{d.diagnosis}</p>
                        <span className="text-xs text-muted">{new Date(d.visit_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted mb-1"><span className="text-white">Symptoms:</span> {d.symptoms}</p>
                      {d.notes && <p className="text-xs text-muted"><span className="text-white">Notes:</span> {d.notes}</p>}
                      <p className="text-xs text-muted mt-1">By {d.doctor_name}</p>
                    </div>
                  ))}
              </div>

              {/* Prescriptions */}
              <div>
                <p className="font-display font-bold text-sm mb-3">Prescriptions</p>
                {detail.prescriptions?.length === 0
                  ? <p className="text-muted text-sm">No prescriptions recorded.</p>
                  : detail.prescriptions?.map(p => (
                    <div key={p.id} className="bg-surface2 border border-border rounded-lg p-4 mb-2">
                      <p className="font-semibold text-sm mb-1">{p.medication}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                        <span><span className="text-white">Dosage:</span> {p.dosage}</span>
                        <span><span className="text-white">Frequency:</span> {p.frequency}</span>
                        <span><span className="text-white">Duration:</span> {p.duration}</span>
                      </div>
                      {p.notes && <p className="text-xs text-muted mt-1"><span className="text-white">Notes:</span> {p.notes}</p>}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </AdminLayout>
  )
}