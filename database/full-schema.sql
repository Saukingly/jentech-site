-- ============================================================
-- Jentech Group website — full database schema
-- Combines every migration built over this project into ONE
-- file, in the correct order, for setting up a brand-new
-- database (e.g. a fresh Railway MySQL instance).
--
-- Run this ONCE against an empty database:
--   mysql -u <user> -p -h <host> -P <port> <database> < full-schema.sql
-- ============================================================

-- ============================================================
-- FROM: schema.sql
-- ============================================================
-- Run this in MySQL to create your database and all tables

CREATE DATABASE IF NOT EXISTS jentech_db;
USE jentech_db;

-- Admin users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  short_desc TEXT,
  full_desc LONGTEXT,
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  location VARCHAR(150),
  service_type VARCHAR(150),
  short_desc TEXT,
  full_desc LONGTEXT,
  image_url VARCHAR(255),
  year INT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE team (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(150),
  office VARCHAR(100),
  bio LONGTEXT,
  image_url VARCHAR(255),
  email VARCHAR(150),
  linkedin VARCHAR(255),
  display_order INT DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts
CREATE TABLE blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  author_id INT,
  category VARCHAR(100),
  image_url VARCHAR(255),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  office VARCHAR(100),
  service VARCHAR(150),
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: default admin account (password: Admin1234!)
INSERT INTO users (name, email, password, role)
VALUES (
  'Jentech Admin',
  'admin@jentechconsultants.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);

-- Seed: sample services
INSERT INTO services (title, slug, short_desc, icon, display_order) VALUES
('Civil Engineering', 'civil-engineering', 'Roads, drainage, and infrastructure design across Jamaica and the Caribbean.', 'building', 1),
('Structural Engineering', 'structural-engineering', 'Analysis and design of buildings, bridges, and complex structural systems.', 'structure', 2),
('Geotechnical Engineering', 'geotechnical-engineering', 'Site investigation, soil testing, and foundation design.', 'ground', 3),
('Environmental Engineering', 'environmental-engineering', 'Environmental assessment and sustainable engineering solutions.', 'globe', 4),
('Project Management', 'project-management', 'End-to-end project delivery from planning through to handover.', 'clipboard', 5),
('Laboratory & Testing', 'laboratory-testing', 'Rigorous soils and materials testing and quality control.', 'flask', 6);
-- ============================================================
-- FROM: clients_schema.sql
-- ============================================================
-- Run this in MySQL AFTER schema.sql has already been run once.
-- Adds the client portal accounts + their project data.
USE jentech_db;

-- Client (customer-facing) accounts — kept separate from the staff `users` table
-- since clients need different fields (company, phone) and different permissions.
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(150),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- One project record per client for now (client_id is UNIQUE below).
-- Structure allows multiple projects per client later if needed —
-- just drop the UNIQUE constraint and adjust the queries in clientPortal.js.
CREATE TABLE IF NOT EXISTS client_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL UNIQUE,
  project_name VARCHAR(200) NOT NULL DEFAULT 'Untitled project',
  sheet_ref VARCHAR(50),
  phase VARCHAR(150),
  completion_percent INT DEFAULT 0,
  next_milestone_label VARCHAR(150),
  next_milestone_date DATE,
  status VARCHAR(100) DEFAULT 'In progress',
  hero_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================================
-- FROM: departments_schema.sql
-- ============================================================
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

-- ============================================================
-- FROM: email_verification_schema.sql
-- ============================================================
-- Run this in MySQL AFTER all previous migrations.
USE jentech_db;

ALTER TABLE clients
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER password,
  ADD COLUMN verification_token VARCHAR(255) NULL,
  ADD COLUMN verification_expires DATETIME NULL;

-- ============================================================
-- FROM: update_services.sql
-- ============================================================
-- Run this after all previous migrations.
-- Replaces the old placeholder services (which didn't match the contact
-- form's actual request categories) with the real 5 services Jentech
-- offers, aligned exactly to the "What service do you need?" dropdown
-- on the contact page and client portal — so a click-through from a
-- service page to "Request this service" pre-fills the right option.
USE jentech_db;

DELETE FROM services;

INSERT INTO services (title, slug, short_desc, full_desc, icon, display_order, published) VALUES

('Civil & Structural Engineering', 'civil-structural-engineering',
 'Multi-disciplinary design for buildings, bridges, roads, and infrastructure across Jamaica and the Caribbean.',
 '<p>Jentech Consultants provides comprehensive civil and structural engineering services covering the full range of building and infrastructure work — from a single consultation through to the design and supervision of large, complex projects.</p>
  <h2>What this covers</h2>
  <ul>
    <li>Analysis and design of multi-storey and industrial structures, and bridges</li>
    <li>Development of building systems, housing units, and layout of housing schemes</li>
    <li>Analysis and design of water supply and sewerage systems, and development of specifications</li>
    <li>Analysis and design of roads and pavements, development of specifications, and site inspection</li>
    <li>Supervision of construction, including site meetings and certification of progress of the works</li>
  </ul>
  <h2>Our approach</h2>
  <p>Every design brings together technical, social, and economic considerations for the community it serves — the goal is always a solution that is as practical to build and maintain as it is sound in engineering terms.</p>',
 'building', 1, true),

('Geotechnical Exploration', 'geotechnical-exploration',
 'Drilling, sampling, and subsurface investigation that determines ground conditions before design begins.',
 '<p>Geotechnical investigation is a critical early stage of any construction project — it determines the engineering characteristics of the ground before foundations, roads, bridges, retaining structures, or other infrastructure are designed. Geotech Exploration Services provides the drilling, sampling, and field-testing data that lets engineers evaluate soil and rock conditions, reduce construction risk, and develop appropriate foundation recommendations.</p>
  <h2>Services</h2>
  <ul>
    <li>Soil boring and marine boring</li>
    <li>Rock coring and mineral exploration</li>
    <li>Piezometer installation and groundwater investigation</li>
    <li>Short bored piles</li>
    <li>Concrete and asphalt coring</li>
    <li>Subsurface field testing</li>
    <li>Geological and geotechnical investigations</li>
  </ul>
  <h2>Why it matters</h2>
  <p>Skipping or under-scoping this stage is one of the most common causes of costly redesign and construction delay. Reliable subsurface data early on protects the budget and the schedule for everything that follows.</p>',
 'ground', 2, true),

('Materials & Soils Testing', 'materials-soils-testing',
 'ASTM-certified laboratory and field testing that verifies construction materials meet design specifications.',
 '<p>Construction materials laboratories provide the technical evidence used to assess whether materials are suitable for their intended purpose. Jets Laboratories delivers ASTM-certified field and laboratory investigation of construction materials, supporting both private developments and public infrastructure projects across Jamaica.</p>
  <h2>Services</h2>
  <h3>Soil Testing</h3>
  <ul>
    <li>Sieve analysis (gradation) and Atterberg limits</li>
    <li>LA abrasion, proctor (modified), and soundness testing</li>
    <li>Absorption, specific gravity, and California Bearing Ratio</li>
    <li>Moisture content, density, and grain size</li>
    <li>Clay/sand composition and strength characteristics</li>
  </ul>
  <h3>Concrete, Asphalt & Aggregate Testing</h3>
  <ul>
    <li>Compression strength tests on concrete cylinders and cubes</li>
    <li>Checking concrete meets design strength</li>
    <li>Road pavement quality, density, and thickness checks</li>
    <li>Testing sand, gravel, and crushed stone for construction quality</li>
  </ul>
  <h2>Why it matters</h2>
  <p>Reliable materials testing helps ensure construction materials perform as expected under design conditions. Independent evaluation of material properties and construction quality gives engineers and project owners documentation for quality control and regulatory compliance.</p>',
 'flask', 3, true),

('Project Management', 'project-management',
 'End-to-end delivery — feasibility studies, design coordination, and construction supervision through to handover.',
 '<p>Jentech provides integrated project management covering economic and feasibility studies, planning, design, and construction oversight — bringing a single point of accountability to projects that would otherwise involve coordinating several separate consultants.</p>
  <h2>What this covers</h2>
  <ul>
    <li>Pre-feasibility, feasibility, and final studies</li>
    <li>Surveys, investigations, and reports on contemplated projects</li>
    <li>Design and preparation of plans, specifications, and quantities</li>
    <li>Engineering management and construction supervision</li>
    <li>Inspection of materials used in construction, as to their conformity with design and specifications</li>
  </ul>
  <h2>Our approach</h2>
  <p>A multi-disciplined team means feasibility, design, and construction supervision stay coordinated under one roof — reducing the handoff friction that typically slows projects down.</p>',
 'clipboard', 4, true),

('Site Investigation', 'site-investigation',
 'Pre-construction surveys and studies that establish site conditions before design work begins.',
 '<p>Before design begins, a proper site investigation establishes exactly what a project is working with — ground conditions, existing infrastructure, and site constraints — so later design and construction decisions are based on evidence rather than assumption.</p>
  <h2>What this covers</h2>
  <ul>
    <li>Pre-feasibility, feasibility, and final site studies</li>
    <li>Topographic and site condition surveys</li>
    <li>Coordination with geotechnical exploration for subsurface data</li>
    <li>Investigations and reports on contemplated projects</li>
  </ul>
  <h2>Why it matters</h2>
  <p>A thorough investigation upfront is what makes an accurate feasibility study possible — catching site constraints early, before they become expensive problems mid-project.</p>',
 'compass', 5, true);

-- ============================================================
-- FROM: enrich_services.sql
-- ============================================================
-- Run this after update_services.sql has already been run.
-- Adds two details from Jentech's real services list that weren't fully
-- captured yet: investigating potential SOURCES of construction materials
-- (not just testing samples already collected), and QC systems/monitoring
-- as an ongoing service rather than a one-off test.
USE jentech_db;

UPDATE services
SET full_desc = '<p>Construction materials laboratories provide the technical evidence used to assess whether materials are suitable for their intended purpose. Jets Laboratories delivers ASTM-certified field and laboratory investigation of construction materials, supporting both private developments and public infrastructure projects across Jamaica.</p>
  <h2>Services</h2>
  <h3>Soil Testing</h3>
  <ul>
    <li>Sieve analysis (gradation) and Atterberg limits</li>
    <li>LA abrasion, proctor (modified), and soundness testing</li>
    <li>Absorption, specific gravity, and California Bearing Ratio</li>
    <li>Moisture content, density, and grain size</li>
    <li>Clay/sand composition and strength characteristics</li>
  </ul>
  <h3>Concrete, Asphalt & Aggregate Testing</h3>
  <ul>
    <li>Compression strength tests on concrete cylinders and cubes</li>
    <li>Checking concrete meets design strength</li>
    <li>Road pavement quality, density, and thickness checks</li>
    <li>Testing sand, gravel, and crushed stone for construction quality</li>
  </ul>
  <h3>Source Investigation &amp; Quality Control</h3>
  <ul>
    <li>Field and laboratory investigation of potential sources of construction materials — evaluating a quarry or borrow pit before it is used, not just testing material already delivered to site</li>
    <li>Quality control systems and monitoring throughout a project, including asphalt and concrete coring, so contractors stay within specification for the life of the works</li>
  </ul>
  <h2>Why it matters</h2>
  <p>Reliable materials testing helps ensure construction materials perform as expected under design conditions. Independent evaluation of material properties and construction quality gives engineers and project owners documentation for quality control and regulatory compliance.</p>'
WHERE slug = 'materials-soils-testing';

-- ============================================================
-- FROM: privacy_and_encryption.sql
-- ============================================================
-- Run this after all previous migrations.
USE jentech_db;

-- Encrypted phone numbers are longer than plain digits (~88 characters),
-- so the column needs more room than the original VARCHAR(50).
ALTER TABLE clients MODIFY COLUMN phone VARCHAR(255);

-- Tracks when each client accepted the Privacy Policy at signup — useful
-- both for your own records and if you're ever asked to demonstrate consent
-- under Jamaica's Data Protection Act.
ALTER TABLE clients ADD COLUMN privacy_accepted_at DATETIME NULL;

