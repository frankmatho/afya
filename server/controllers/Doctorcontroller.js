const bcrypt = require('bcryptjs')
const Doctor = require('../models/doctorModel')
const User   = require('../models/userModel')

const uid = () => 'DOC' + Math.random().toString(36).slice(2, 5).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase()

// GET /api/doctors
const getDoctors = async (req, res) => {
  try {
    res.json(await Doctor.getAll())
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/doctors/:id
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.getById(req.params.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })
    res.json(doctor)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/doctors — admin creates doctor + user account
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, department_id, phone } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password required' })

    const existing = await User.findByEmail(email)
    if (existing) return res.status(409).json({ message: 'Email already in use' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user   = await User.createUser({ name, email, hashedPassword, role: 'doctor' })
    const doctor = await Doctor.create({ user_id: user.id, doctor_id: uid(), specialization, department_id, phone })

    res.status(201).json({ ...doctor, name: user.name, email: user.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/doctors/:id — admin updates doctor
const updateDoctor = async (req, res) => {
  try {
    const { name, email, specialization, department_id, phone, status } = req.body
    const doctor = await Doctor.getById(req.params.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })

    await Doctor.updateUserInfo(doctor.user_id, { name, email })
    const updated = await Doctor.update(req.params.id, { specialization, department_id, phone, status })
    res.json({ ...updated, name, email })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// PATCH /api/doctors/:id/status — toggle active/inactive
const toggleStatus = async (req, res) => {
  try {
    const { status } = req.body
    await Doctor.updateStatus(req.params.id, status)
    res.json({ message: `Doctor ${status === 'Active' ? 'activated' : 'deactivated'}` })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, toggleStatus }