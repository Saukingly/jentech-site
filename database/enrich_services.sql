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