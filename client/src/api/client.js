const BASE = import.meta.env.VITE_API_URL ||'http://localhost:5001/api'
const getToken = () => localStorage.getItem('afya_token')
const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
})
const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  login:   (body) => req('POST', '/auth/login', body),
  me:      ()     => req('GET',  '/auth/me'),
  getDoctors:    ()         => req('GET',   '/doctors'),
  getDoctor:     (id)       => req('GET',   `/doctors/${id}`),
  createDoctor:  (body)     => req('POST',  '/doctors', body),
  updateDoctor:  (id, body) => req('PUT',   `/doctors/${id}`, body),
  toggleStatus:  (id, body) => req('PATCH', `/doctors/${id}/status`, body),
  getPatients:   ()         => req('GET',  '/patients'),
  getPatient:    (id)       => req('GET',  `/patients/${id}`),
  createPatient: (body)     => req('POST', '/patients', body),
  updatePatient: (id, body) => req('PUT',  `/patients/${id}`, body),
  getDiagnoses:       (pid)           => req('GET',  `/patients/${pid}/diagnoses`),
  createDiagnosis:    (pid, body)     => req('POST', `/patients/${pid}/diagnoses`, body),
  updateDiagnosis:    (pid, id, body) => req('PUT',  `/patients/${pid}/diagnoses/${id}`, body),
  getPrescriptions:   (pid)           => req('GET',  `/patients/${pid}/prescriptions`),
  createPrescription: (pid, body)     => req('POST', `/patients/${pid}/prescriptions`, body),
  updatePrescription: (pid, id, body) => req('PUT',  `/patients/${pid}/prescriptions/${id}`, body),
  getDepartments:   ()         => req('GET',  '/departments'),
  createDepartment: (body)     => req('POST', '/departments', body),
  updateDepartment: (id, body) => req('PUT',  `/departments/${id}`, body),
}