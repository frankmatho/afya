const router = require('express').Router({ mergeParams: true })
const { getPrescriptions, createPrescription, updatePrescription } = require('../controllers/prescriptionController')
const { protect, doctorOnly } = require('../middleware/auth')

router.use(protect)
router.get('/',    getPrescriptions)
router.post('/',   doctorOnly, createPrescription)
router.put('/:id', doctorOnly, updatePrescription)

module.exports = router