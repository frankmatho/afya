const pool = require('../config/db')

const getAll = async () => {
  const result = await pool.query(`
    SELECT d.*, u.name, u.email, u.role, dep.name AS department_name
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN departments dep ON d.department_id = dep.id
    ORDER BY d.created_at DESC
  `)
  return result.rows
}

const getByUserId = async (userId) => {
  const result = await pool.query(`
    SELECT d.*, u.name, u.email, dep.name AS department_name
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN departments dep ON d.department_id = dep.id
    WHERE d.user_id = $1
  `, [userId])
  return result.rows[0]
}

const getById = async (id) => {
  const result = await pool.query(`
    SELECT d.*, u.name, u.email, dep.name AS department_name
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN departments dep ON d.department_id = dep.id
    WHERE d.id = $1
  `, [id])
  return result.rows[0]
}

const create = async ({ user_id, doctor_id, specialization, department_id, phone }) => {
  const result = await pool.query(
    `INSERT INTO doctors (user_id, doctor_id, specialization, department_id, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, doctor_id, specialization, department_id, phone]
  )
  return result.rows[0]
}

const update = async (id, { specialization, department_id, phone, status }) => {
  const result = await pool.query(
    `UPDATE doctors SET specialization=$1, department_id=$2, phone=$3, status=$4
     WHERE id=$5 RETURNING *`,
    [specialization, department_id, phone, status, id]
  )
  return result.rows[0]
}

const updateUserInfo = async (userId, { name, email }) => {
  await pool.query('UPDATE users SET name=$1, email=$2 WHERE id=$3', [name, email, userId])
}

const updateStatus = async (id, status) => {
  await pool.query('UPDATE doctors SET status=$1 WHERE id=$2', [status, id])
  // Also update user status if deactivating
  if (status === 'Inactive') {
    await pool.query(`
      UPDATE users SET role='doctor' WHERE id=(SELECT user_id FROM doctors WHERE id=$1)
    `, [id])
  }
}

module.exports = { getAll, getByUserId, getById, create, update, updateUserInfo, updateStatus }