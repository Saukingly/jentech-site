-- Run this after all previous migrations.
USE jentech_db;

-- Encrypted phone numbers are longer than plain digits (~88 characters),
-- so the column needs more room than the original VARCHAR(50).
ALTER TABLE clients MODIFY COLUMN phone VARCHAR(255);

-- Tracks when each client accepted the Privacy Policy at signup — useful
-- both for your own records and if you're ever asked to demonstrate consent
-- under Jamaica's Data Protection Act.
ALTER TABLE clients ADD COLUMN privacy_accepted_at DATETIME NULL;
