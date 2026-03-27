require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const authRoutes         = require('./routes/AuthRoutes')
const doctorRoutes       = require('./routes/DoctorRoutes')
const patientRoutes      = require('./routes/PatientRoutes')
const diagnosisRoutes    = require('./routes/DiagnosisRoutes')
const prescriptionRoutes = require('./routes/PrescriptionRoutes')
const departmentRoutes   = require('./routes/DepartmentRoutes')

const app  = express()
const PORT = process.env.PORT || 5001

app.use(cors({ 
  origin: [
    'http://localhost:5173',
     'https://afya-ochre.vercel.app'
  ], 
  credentials: true 
}))
app.use(express.json())

app.use('/api/auth',        authRoutes)
app.use('/api/doctors',     doctorRoutes)
app.use('/api/patients',    patientRoutes)
app.use('/api/patients/:patientId/diagnoses',    diagnosisRoutes)
app.use('/api/patients/:patientId/prescriptions', prescriptionRoutes)
app.use('/api/departments', departmentRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'Afya HMS' }))
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => console.log(`🏥 Afya server running on http://localhost:${PORT}`))