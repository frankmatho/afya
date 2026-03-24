require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const authRoutes         = require('./routes/authRoutes')
const doctorRoutes       = require('./routes/doctorRoutes')
const patientRoutes      = require('./routes/patientRoutes')
const diagnosisRoutes    = require('./routes/diagnosisRoutes')
const prescriptionRoutes = require('./routes/prescriptionRoutes')
const departmentRoutes   = require('./routes/departmentRoutes')

const app  = express()
const PORT = process.env.PORT || 5001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
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