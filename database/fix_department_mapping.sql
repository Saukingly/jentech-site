<<<<<<< HEAD
-- Only needed if you already ran the original departments_schema.sql.
-- That version's service-name mapping didn't match your actual contact form
-- dropdown values, so any submissions received before this fix were left
-- with department = NULL. This re-applies the correct mapping — safe to run
-- any time, it only touches rows that are still NULL.
=======

>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
USE jentech_db;

UPDATE contact_submissions SET department = 'Jentech Consultants'
  WHERE service IN ('Civil & Structural Engineering','Project Management','Other') AND department IS NULL;
UPDATE contact_submissions SET department = 'Geotech Exploration Services'
  WHERE service IN ('Geotechnical Exploration','Site Investigation') AND department IS NULL;
UPDATE contact_submissions SET department = 'Jets Laboratories'
  WHERE service = 'Materials & Soils Testing' AND department IS NULL;
UPDATE contact_submissions SET department = 'Jentech Consultants'
<<<<<<< HEAD
  WHERE (service IS NULL OR service = '') AND department IS NULL;
=======
  WHERE (service IS NULL OR service = '') AND department IS NULL;
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
