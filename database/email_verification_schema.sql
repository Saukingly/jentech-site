<<<<<<< HEAD
-- Run this in MySQL AFTER all previous migrations.
=======

>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
USE jentech_db;

ALTER TABLE clients
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER password,
  ADD COLUMN verification_token VARCHAR(255) NULL,
<<<<<<< HEAD
  ADD COLUMN verification_expires DATETIME NULL;
=======
  ADD COLUMN verification_expires DATETIME NULL;
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
