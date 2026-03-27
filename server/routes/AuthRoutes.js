// authRoutes.js
const authRouter = require('express').Router()
const { login, getMe } = require('../controllers/AuthController')
const { protect } = require('../middleware/auth')
authRouter.post('/login', login)
authRouter.get('/me', protect, getMe)
module.exports = authRouter