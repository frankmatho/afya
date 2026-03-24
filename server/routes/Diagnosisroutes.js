const router = require('express').Router({ mergeParams: true })
const { getDiagnoses, createDiagnosis, updateDiagnosis } = require('../controllers/diagnosisController')
const { protect, doctorOnly } = require('../middleware/auth')

router.use(protect)
router.get('/',    getDiagnoses)
router.post('/',   doctorOnly, createDiagnosis)
router.put('/:id', doctorOnly, updateDiagnosis)

module.exports = router