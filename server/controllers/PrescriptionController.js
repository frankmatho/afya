const Prescription = require('../models/PrescriptionModel')
const Doctor       = require('../models/DoctorModel')
const Patient      = require('../models/PatientModel')

// GET /api/patients/:patientId/prescriptions
const getPrescriptions = async (req, res) => {
  try {
    res.json(await Prescription.getByPatient(req.params.patientId))
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/patients/:patientId/prescriptions
const createPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.getByUserId(req.user.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' })

    const patient = await Patient.getById(req.params.patientId)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })
    if (patient.doctor_id !== doctor.id)
      return res.status(403).json({ message: 'Access denied' })

    const prescription = await Prescription.create({
      ...req.body,
      patient_id: req.params.patientId,
      doctor_id: doctor.id,
    })
    res.status(201).json(prescription)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/prescriptions/:id
const updatePrescription = async (req, res) => {
  try {
    const updated = await Prescription.update(req.params.id, req.body)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getPrescriptions, createPrescription, updatePrescription }