const Diagnosis = require('../models/diagnosisModel')
const Doctor    = require('../models/doctorModel')
const Patient   = require('../models/patientModel')

// GET /api/patients/:patientId/diagnoses
const getDiagnoses = async (req, res) => {
  try {
    res.json(await Diagnosis.getByPatient(req.params.patientId))
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/patients/:patientId/diagnoses
const createDiagnosis = async (req, res) => {
  try {
    const doctor = await Doctor.getByUserId(req.user.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' })

    const patient = await Patient.getById(req.params.patientId)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })
    if (patient.doctor_id !== doctor.id)
      return res.status(403).json({ message: 'Access denied' })

    const diagnosis = await Diagnosis.create({
      ...req.body,
      patient_id: req.params.patientId,
      doctor_id: doctor.id,
    })
    res.status(201).json(diagnosis)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/diagnoses/:id
const updateDiagnosis = async (req, res) => {
  try {
    const updated = await Diagnosis.update(req.params.id, req.body)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getDiagnoses, createDiagnosis, updateDiagnosis }