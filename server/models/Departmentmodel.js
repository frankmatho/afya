const pool = require('../config/db')

const getAll = async () => {
  const result = await pool.query(`
    SELECT dep.*, COUNT(d.id) AS doctor_count
    FROM departments dep
    LEFT JOIN doctors d ON dep.id = d.department_id AND d.status = 'Active'
    GROUP BY dep.id
    ORDER BY dep.name
  `)
  return result.rows
}

const create = async ({ name, description }) => {
  const result = await pool.query(
    'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  )
  return result.rows[0]
}

const update = async (id, { name, description }) => {
  const result = await pool.query(
    'UPDATE departments SET name=$1, description=$2 WHERE id=$3 RETURNING *',
    [name, description, id]
  )
  return result.rows[0]
}

module.exports = { getAll, create, update }