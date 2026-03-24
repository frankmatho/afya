const pool = require('../config/db')

const getByPatient = async (patientId) => {
  const result = await pool.query(`
    SELECT diag.*, u.name AS doctor_name
    FROM diagnoses diag
    LEFT JOIN doctors d ON diag.doctor_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE diag.patient_id = $1
    ORDER BY diag.visit_date DESC
  `, [patientId])
  return result.rows
}

const create = async ({ patient_id, doctor_id, symptoms, diagnosis, notes, visit_date }) => {
  const result = await pool.query(
    `INSERT INTO diagnoses (patient_id, doctor_id, symptoms, diagnosis, notes, visit_date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [patient_id, doctor_id, symptoms, diagnosis, notes, visit_date || new Date()]
  )
  return result.rows[0]
}

const update = async (id, { symptoms, diagnosis, notes, visit_date }) => {
  const result = await pool.query(
    `UPDATE diagnoses SET symptoms=$1, diagnosis=$2, notes=$3, visit_date=$4
     WHERE id=$5 RETURNING *`,
    [symptoms, diagnosis, notes, visit_date, id]
  )
  return result.rows[0]
}

module.exports = { getByPatient, create, update }