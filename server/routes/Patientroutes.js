const router = require('express').Router()
const { getPatients, getPatient, createPatient, updatePatient, getStats } = require('../controllers/patientController')
const { protect, doctorOnly } = require('../middleware/auth')

router.use(protect)
router.get('/stats', getStats)
router.get('/',      getPatients)
router.get('/:id',   getPatient)
router.post('/',     doctorOnly, createPatient)
router.put('/:id',   doctorOnly, updatePatient)
// NO DELETE route — intentional

module.exports = router