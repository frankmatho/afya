-- Run: psql -U postgres -d afya -f config/schema.sql

-- Users (admin + doctors login)
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'doctor' CHECK (role IN ('admin', 'doctor')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Doctors (extends users with medical info)
CREATE TABLE IF NOT EXISTS doctors (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  doctor_id     VARCHAR(20) UNIQUE NOT NULL,
  specialization VARCHAR(100),
  department_id  INTEGER REFERENCES departments(id),
  phone         VARCHAR(30),
  status        VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Patients (no delete allowed — enforced at API level)
CREATE TABLE IF NOT EXISTS patients (
  id            SERIAL PRIMARY KEY,
  patient_id    VARCHAR(20) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  age           INTEGER,
  gender        VARCHAR(20),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  blood_type    VARCHAR(10),
  allergies     TEXT,
  doctor_id     INTEGER REFERENCES doctors(id),
  status        VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
  id          SERIAL PRIMARY KEY,
  patient_id  INTEGER REFERENCES patients(id),
  doctor_id   INTEGER REFERENCES doctors(id),
  symptoms    TEXT,
  diagnosis   TEXT,
  notes       TEXT,
  visit_date  DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id          SERIAL PRIMARY KEY,
  patient_id  INTEGER REFERENCES patients(id),
  doctor_id   INTEGER REFERENCES doctors(id),
  diagnosis_id INTEGER REFERENCES diagnoses(id),
  medication  VARCHAR(150) NOT NULL,
  dosage      VARCHAR(100),
  frequency   VARCHAR(100),
  duration    VARCHAR(100),
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Seed departments
INSERT INTO departments (name, description) VALUES
  ('General Medicine',  'Primary healthcare and general consultations'),
  ('Cardiology',        'Heart and cardiovascular system'),
  ('Pediatrics',        'Child healthcare'),
  ('Orthopedics',       'Bones, joints and musculoskeletal system'),
  ('Neurology',         'Brain and nervous system')
ON CONFLICT (name) DO NOTHING;

-- Seed admin (password: password123)
INSERT INTO users (name, email, password, role) VALUES
  ('Hospital Admin', 'admin@afya.co', '$2b$10$b6Tc9rjaD9Krokqg/2HpvO9nhpDx2Bc8X.IAEr.Y994DLNps/ZjPW', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed doctor user
INSERT INTO users (name, email, password, role) VALUES
  ('Dr. James Mwangi', 'doctor@afya.co', '$2b$10$b6Tc9rjaD9Krokqg/2HpvO9nhpDx2Bc8X.IAEr.Y994DLNps/ZjPW', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- Seed doctor profile
INSERT INTO doctors (user_id, doctor_id, specialization, department_id, phone, status)
SELECT u.id, 'DOC001', 'General Practitioner', d.id, '+254700000001', 'Active'
FROM users u, departments d
WHERE u.email = 'doctor@afya.co' AND d.name = 'General Medicine'
ON CONFLICT (user_id) DO NOTHING;