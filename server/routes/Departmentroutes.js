const router = require('express').Router()
const { getDepartments, createDepartment, updateDepartment } = require('../controllers/DepartmentController')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect)
router.get('/',    getDepartments)
router.post('/',   adminOnly, createDepartment)
router.put('/:id', adminOnly, updateDepartment)

module.exports = router