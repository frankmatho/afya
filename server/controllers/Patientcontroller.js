const Patient      = require('../models/patientModel')
const Doctor       = require('../models/doctorModel')
const Diagnosis    = require('../models/diagnosisModel')
const Prescription = require('../models/prescriptionModel')

const uid = () => 'PAT' + Math.random().toString(36).slice(2, 5).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase()

// GET /api/patients — admin gets all, doctor gets own
const getPatients = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      res.json(await Patient.getAll())
    } else {
      const doctor = await Doctor.getByUserId(req.user.id)
      if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' })
      res.json(await Patient.getByDoctorId(doctor.id))
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/patients/:id
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.getById(req.params.id)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })

    // Doctors can only see their own patients
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.getByUserId(req.user.id)
      if (patient.doctor_id !== doctor.id)
        return res.status(403).json({ message: 'Access denied' })
    }

    const diagnoses     = await Diagnosis.getByPatient(patient.id)
    const prescriptions = await Prescription.getByPatient(patient.id)
    res.json({ ...patient, diagnoses, prescriptions })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/patients — doctors only
const createPatient = async (req, res) => {
  try {
    const doctor = await Doctor.getByUserId(req.user.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' })

    const patient = await Patient.create({ ...req.body, patient_id: uid(), doctor_id: doctor.id })
    res.status(201).json(patient)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/patients/:id — doctors only, own patients
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.getById(req.params.id)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })

    const doctor = await Doctor.getByUserId(req.user.id)
    if (patient.doctor_id !== doctor.id)
      return res.status(403).json({ message: 'You can only edit your own patients' })

    const updated = await Patient.update(req.params.id, req.body)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/patients/stats — admin only
const getStats = async (req, res) => {
  try {
    const stats = await Patient.getStats()
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// NO DELETE endpoint — intentional

module.exports = { getPatients, getPatient, createPatient, updatePatient, getStats }