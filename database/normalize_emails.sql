
USE jentech_db;

UPDATE clients SET email = LOWER(TRIM(email));
UPDATE contact_submissions SET email = LOWER(TRIM(email));
UPDATE reports SET client_email = LOWER(TRIM(client_email));