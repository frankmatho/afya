const Department = require('../models/DepartmentModel')

const getDepartments = async (req, res) => {
  try { res.json(await Department.getAll()) }
  catch (err) { res.status(500).json({ message: 'Server error' }) }
}

const createDepartment = async (req, res) => {
  try {
    const dep = await Department.create(req.body)
    res.status(201).json(dep)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

const updateDepartment = async (req, res) => {
  try {
    const dep = await Department.update(req.params.id, req.body)
    res.json(dep)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getDepartments, createDepartment, updateDepartment }