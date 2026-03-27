const router = require('express').Router()
const { getDoctors, getDoctor, createDoctor, updateDoctor, toggleStatus } = require('../controllers/DoctorController')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect)
router.get('/',    getDoctors)
router.get('/:id', getDoctor)
router.post('/',           adminOnly, createDoctor)
router.put('/:id',         adminOnly, updateDoctor)
router.patch('/:id/status',adminOnly, toggleStatus)

module.exports = router