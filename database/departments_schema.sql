-- Run this in MySQL AFTER schema.sql and clients_schema.sql have already been run.
-- Adds department-scoped staff accounts, inquiry routing/status, and the reports
-- system that feeds documents into the client portal.
USE jentech_db;

-- Staff accounts now belong to one of the three companies (or NULL for admins
-- who can see everything). No more public self-signup — admins create these
-- from the Staff Accounts panel.
ALTER TABLE users
  ADD COLUMN department VARCHAR(100) NULL AFTER role;

-- Route each inquiry to a department, and track whether staff have replied.
ALTER TABLE contact_submissions
  ADD COLUMN department VARCHAR(100) NULL AFTER service,
  ADD COLUMN status ENUM('pending','answered') DEFAULT 'pending' AFTER department;

-- Backfill department on any existing submissions based on the service they picked
UPDATE contact_submissions SET department = 'Jentech Consultants'
  WHERE service IN ('Civil & Structural Engineering','Project Management','Other') AND department IS NULL;
UPDATE contact_submissions SET department = 'Geotech Exploration Services'
  WHERE service IN ('Geotechnical Exploration','Site Investigation') AND department IS NULL;
UPDATE contact_submissions SET department = 'Jets Laboratories'
  WHERE service = 'Materials & Soils Testing' AND department IS NULL;
UPDATE contact_submissions SET department = 'Jentech Consultants'
  WHERE (service IS NULL OR service = '') AND department IS NULL;

-- Reports: the real deliverables staff send back to clients (site investigation
-- reports, lab test results, geotechnical recommendations, inspection findings,
-- invoices). Matched to a client by email so it shows up in their portal even
-- if their account didn't exist yet when the inquiry came in.
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NULL,
  client_email VARCHAR(150) NOT NULL,
  department VARCHAR(100),
  category ENUM('Site Investigation Report','Lab Test Results','Geotechnical Recommendations','Inspection Findings','Invoice') NOT NULL,
  title VARCHAR(255) NOT NULL,
  notes LONGTEXT,
  amount DECIMAL(10,2) NULL,
  file_url VARCHAR(255),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES contact_submissions(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
