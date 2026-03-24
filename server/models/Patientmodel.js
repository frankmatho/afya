const pool = require('../config/db')

// Admin: get all patients
const getAll = async () => {
  const result = await pool.query(`
    SELECT p.*, u.name AS doctor_name, d.specialization
    FROM patients p
    LEFT JOIN doctors d ON p.doctor_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY p.created_at DESC
  `)
  return result.rows
}

// Doctor: get only their patients
const getByDoctorId = async (doctorId) => {
  const result = await pool.query(`
    SELECT p.*, u.name AS doctor_name
    FROM patients p
    LEFT JOIN doctors d ON p.doctor_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE p.doctor_id = $1
    ORDER BY p.created_at DESC
  `, [doctorId])
  return result.rows
}

const getById = async (id) => {
  const result = await pool.query(`
    SELECT p.*, u.name AS doctor_name
    FROM patients p
    LEFT JOIN doctors d ON p.doctor_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE p.id = $1
  `, [id])
  return result.rows[0]
}

const create = async ({ patient_id, name, age, gender, phone, email, blood_type, allergies, doctor_id }) => {
  const result = await pool.query(
    `INSERT INTO patients (patient_id, name, age, gender, phone, email, blood_type, allergies, doctor_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [patient_id, name, age, gender, phone, email, blood_type, allergies, doctor_id]
  )
  return result.rows[0]
}

// Only update — no delete
const update = async (id, { name, age, gender, phone, email, blood_type, allergies, status }) => {
  const result = await pool.query(
    `UPDATE patients SET name=$1, age=$2, gender=$3, phone=$4, email=$5,
     blood_type=$6, allergies=$7, status=$8, updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [name, age, gender, phone, email, blood_type, allergies, status, id]
  )
  return result.rows[0]
}

const getStats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'Active') AS active,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS this_month
    FROM patients
  `)
  return result.rows[0]
}

module.exports = { getAll, getByDoctorId, getById, create, update, getStats }