const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const User    = require('../models/UserModel')
const Doctor  = require('../models/DoctorModel')

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findByEmail(email)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    // If doctor, attach doctor profile
    let doctorProfile = null
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.getByUserId(user.id)
    }

    const token = generateToken(user)
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      doctorProfile,
      token,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    let doctorProfile = null
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.getByUserId(user.id)
    }
    res.json({ user, doctorProfile })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { login, getMe }