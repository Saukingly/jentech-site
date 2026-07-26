

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

-- Seed: default admin account 
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