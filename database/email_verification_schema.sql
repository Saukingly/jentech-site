-- Run this in MySQL AFTER all previous migrations.
USE jentech_db;

ALTER TABLE clients
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER password,
  ADD COLUMN verification_token VARCHAR(255) NULL,
  ADD COLUMN verification_expires DATETIME NULL;
