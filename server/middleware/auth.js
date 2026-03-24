const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token, authorization denied' })

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Token is invalid or expired' })
  }
}

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied: Admins only' })
  next()
}

const doctorOnly = (req, res, next) => {
  if (req.user.role !== 'doctor')
    return res.status(403).json({ message: 'Access denied: Doctors only' })
  next()
}

module.exports = { protect, adminOnly, doctorOnly }