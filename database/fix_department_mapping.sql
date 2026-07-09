
USE jentech_db;

UPDATE contact_submissions SET department = 'Jentech Consultants'
  WHERE service IN ('Civil & Structural Engineering','Project Management','Other') AND department IS NULL;
UPDATE contact_submissions SET department = 'Geotech Exploration Services'
  WHERE service IN ('Geotechnical Exploration','Site Investigation') AND department IS NULL;
UPDATE contact_submissions SET department = 'Jets Laboratories'
  WHERE service = 'Materials & Soils Testing' AND department IS NULL;
UPDATE contact_submissions SET department = 'Jentech Consultants'
  WHERE (service IS NULL OR service = '') AND department IS NULL;