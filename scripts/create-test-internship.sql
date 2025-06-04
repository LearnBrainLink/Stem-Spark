-- Create a test internship for testing apply functionality
DO $$
DECLARE
  internship_id1 UUID := gen_random_uuid();
  internship_id2 UUID := gen_random_uuid();
  internship_id3 UUID := gen_random_uuid();
  admin_id UUID := '11111111-1111-1111-1111-111111111111';
  director_id UUID := '22222222-2222-2222-2222-222222222222';
  coordinator_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- Insert test internships with proper UUIDs
  INSERT INTO internships (
    id,
    title,
    description,
    company,
    location,
    duration,
    requirements,
    application_deadline,
    start_date,
    end_date,
    max_participants,
    current_participants,
    status,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    internship_id1,
    'Software Development Internship',
    'Join our team to learn full-stack web development using modern technologies like React, Node.js, and databases. You will work on real projects and gain hands-on experience in software engineering.',
    'TechCorp Solutions',
    'San Francisco, CA',
    '8 weeks',
    'Basic programming knowledge in JavaScript or Python. Enthusiasm to learn and work in a team environment. Currently enrolled in grades 6-8.',
    '2025-02-15',
    '2025-03-01',
    '2025-04-26',
    5,
    0,
    'active',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    internship_id2,
    'Data Science Exploration',
    'Explore the world of data science and analytics. Learn to work with datasets, create visualizations, and understand basic machine learning concepts through hands-on projects.',
    'DataWorks Inc',
    'Austin, TX',
    '6 weeks',
    'Interest in mathematics and problem-solving. Basic computer skills. Grades 7-8 preferred.',
    '2025-02-20',
    '2025-03-15',
    '2025-04-26',
    8,
    2,
    'active',
    director_id,
    NOW(),
    NOW()
  ),
  (
    internship_id3,
    'Robotics Engineering Program',
    'Build and program robots using Arduino and sensors. Learn about mechanical design, electronics, and programming while working on exciting robotics projects.',
    'RoboTech Academy',
    'Seattle, WA',
    '10 weeks',
    'Interest in engineering and technology. No prior experience required. Grades 5-8 welcome.',
    '2025-01-30',
    '2025-02-15',
    '2025-04-26',
    6,
    1,
    'active',
    coordinator_id,
    NOW(),
    NOW()
  );

  -- Verify internships were created
  RAISE NOTICE 'Created test internships with IDs: %s, %s, %s', internship_id1, internship_id2, internship_id3;
END $$;

-- Display all internships
SELECT 
  id,
  title,
  company,
  location,
  max_participants,
  current_participants,
  application_deadline,
  status
FROM internships 
ORDER BY created_at DESC
LIMIT 5;
