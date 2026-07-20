
USE jentech_db;

DELETE FROM services;

INSERT INTO services (title, slug, short_desc, full_desc, icon, display_order, published) VALUES

('Civil & Structural Engineering', 'civil-structural-engineering',
 'Multi-disciplinary design for buildings, bridges, roads, and infrastructure across Jamaica and the Caribbean.',
 '<p>Jentech Consultants provides comprehensive civil and structural engineering services covering the full range of building and infrastructure work — from a single consultation through to the design and supervision of large, complex projects.</p>
  <h2>What this covers</h2>
  <ul>
    <li>Analysis and design of multi-storey and industrial structures, and bridges</li>
    <li>Development of building systems, housing units, and layout of housing schemes</li>
    <li>Analysis and design of water supply and sewerage systems, and development of specifications</li>
    <li>Analysis and design of roads and pavements, development of specifications, and site inspection</li>
    <li>Supervision of construction, including site meetings and certification of progress of the works</li>
  </ul>
  <h2>Our approach</h2>
  <p>Every design brings together technical, social, and economic considerations for the community it serves — the goal is always a solution that is as practical to build and maintain as it is sound in engineering terms.</p>',
 'building', 1, true),

('Geotechnical Exploration', 'geotechnical-exploration',
 'Drilling, sampling, and subsurface investigation that determines ground conditions before design begins.',
 '<p>Geotechnical investigation is a critical early stage of any construction project — it determines the engineering characteristics of the ground before foundations, roads, bridges, retaining structures, or other infrastructure are designed. Geotech Exploration Services provides the drilling, sampling, and field-testing data that lets engineers evaluate soil and rock conditions, reduce construction risk, and develop appropriate foundation recommendations.</p>
  <h2>Services</h2>
  <ul>
    <li>Soil boring and marine boring</li>
    <li>Rock coring and mineral exploration</li>
    <li>Piezometer installation and groundwater investigation</li>
    <li>Short bored piles</li>
    <li>Concrete and asphalt coring</li>
    <li>Subsurface field testing</li>
    <li>Geological and geotechnical investigations</li>
  </ul>
  <h2>Why it matters</h2>
  <p>Skipping or under-scoping this stage is one of the most common causes of costly redesign and construction delay. Reliable subsurface data early on protects the budget and the schedule for everything that follows.</p>',
 'ground', 2, true),

('Materials & Soils Testing', 'materials-soils-testing',
 'ASTM-certified laboratory and field testing that verifies construction materials meet design specifications.',
 '<p>Construction materials laboratories provide the technical evidence used to assess whether materials are suitable for their intended purpose. Jets Laboratories delivers ASTM-certified field and laboratory investigation of construction materials, supporting both private developments and public infrastructure projects across Jamaica.</p>
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
  <h2>Why it matters</h2>
  <p>Reliable materials testing helps ensure construction materials perform as expected under design conditions. Independent evaluation of material properties and construction quality gives engineers and project owners documentation for quality control and regulatory compliance.</p>',
 'flask', 3, true),

('Project Management', 'project-management',
 'End-to-end delivery — feasibility studies, design coordination, and construction supervision through to handover.',
 '<p>Jentech provides integrated project management covering economic and feasibility studies, planning, design, and construction oversight — bringing a single point of accountability to projects that would otherwise involve coordinating several separate consultants.</p>
  <h2>What this covers</h2>
  <ul>
    <li>Pre-feasibility, feasibility, and final studies</li>
    <li>Surveys, investigations, and reports on contemplated projects</li>
    <li>Design and preparation of plans, specifications, and quantities</li>
    <li>Engineering management and construction supervision</li>
    <li>Inspection of materials used in construction, as to their conformity with design and specifications</li>
  </ul>
  <h2>Our approach</h2>
  <p>A multi-disciplined team means feasibility, design, and construction supervision stay coordinated under one roof — reducing the handoff friction that typically slows projects down.</p>',
 'clipboard', 4, true),

('Site Investigation', 'site-investigation',
 'Pre-construction surveys and studies that establish site conditions before design work begins.',
 '<p>Before design begins, a proper site investigation establishes exactly what a project is working with — ground conditions, existing infrastructure, and site constraints — so later design and construction decisions are based on evidence rather than assumption.</p>
  <h2>What this covers</h2>
  <ul>
    <li>Pre-feasibility, feasibility, and final site studies</li>
    <li>Topographic and site condition surveys</li>
    <li>Coordination with geotechnical exploration for subsurface data</li>
    <li>Investigations and reports on contemplated projects</li>
  </ul>
  <h2>Why it matters</h2>
  <p>A thorough investigation upfront is what makes an accurate feasibility study possible — catching site constraints early, before they become expensive problems mid-project.</p>',
 'compass', 5, true);