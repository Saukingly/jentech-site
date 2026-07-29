-- Only needed once, to clean up any accounts/submissions/reports created
-- before email normalization was added. Safe to run any time — it just
-- trims and lowercases existing values so matching becomes case-insensitive
-- and whitespace-proof going forward.
USE jentech_db;

UPDATE clients SET email = LOWER(TRIM(email));
UPDATE contact_submissions SET email = LOWER(TRIM(email));
UPDATE reports SET client_email = LOWER(TRIM(client_email));
