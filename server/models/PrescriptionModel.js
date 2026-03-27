const pool = require('../config/db')

const getByPatient = async (patientId) => {
  const result = await pool.query(`
    SELECT pres.*, u.name AS doctor_name
    FROM prescriptions pres
    LEFT JOIN doctors d ON pres.doctor_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE pres.patient_id = $1
    ORDER BY pres.created_at DESC
  `, [patientId])
  return result.rows
}

const create = async ({ patient_id, doctor_id, diagnosis_id, medication, dosage, frequency, duration, notes }) => {
  const result = await pool.query(
    `INSERT INTO prescriptions (patient_id, doctor_id, diagnosis_id, medication, dosage, frequency, duration, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [patient_id, doctor_id, diagnosis_id || null, medication, dosage, frequency, duration, notes]
  )
  return result.rows[0]
}

const update = async (id, { medication, dosage, frequency, duration, notes }) => {
  const result = await pool.query(
    `UPDATE prescriptions SET medication=$1, dosage=$2, frequency=$3, duration=$4, notes=$5
     WHERE id=$6 RETURNING *`,
    [medication, dosage, frequency, duration, notes, id]
  )
  return result.rows[0]
}

module.exports = { getByPatient, create, update }