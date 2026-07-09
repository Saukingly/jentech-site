
USE jentech_db;

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(150),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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