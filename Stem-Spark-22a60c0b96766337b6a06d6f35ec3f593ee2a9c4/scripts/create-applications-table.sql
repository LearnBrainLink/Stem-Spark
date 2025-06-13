-- Create function to ensure applications table exists
CREATE OR REPLACE FUNCTION create_applications_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'applications'
  ) THEN
    -- Create the applications table
    CREATE TABLE applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL,
      internship_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      student_statement TEXT,
      parent_approval BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add comment
    COMMENT ON TABLE applications IS 'Stores student applications for internships';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_applications_table_if_not_exists();

-- Create function to ensure internship_applications table exists
CREATE OR REPLACE FUNCTION create_internship_applications_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'internship_applications'
  ) THEN
    -- Create the internship_applications table
    CREATE TABLE internship_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL,
      internship_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      application_text TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add comment
    COMMENT ON TABLE internship_applications IS 'Stores student applications for internships';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_internship_applications_table_if_not_exists();

-- Create sample internships if none exist
DO $$
DECLARE
  internship_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO internship_count FROM internships;
  
  IF internship_count = 0 THEN
    INSERT INTO internships (
      title, 
      company, 
      description, 
      location, 
      requirements, 
      duration, 
      application_deadline, 
      start_date, 
      end_date, 
      max_participants, 
      current_participants, 
      status
    ) VALUES 
    (
      'Software Development Intern', 
      'Tech Solutions Inc.', 
      'Join our team to develop cutting-edge software solutions for real-world problems.', 
      'Remote', 
      'Basic programming knowledge, interest in software development', 
      '8 weeks', 
      (CURRENT_DATE + INTERVAL '30 days')::DATE, 
      (CURRENT_DATE + INTERVAL '45 days')::DATE, 
      (CURRENT_DATE + INTERVAL '105 days')::DATE, 
      10, 
      0, 
      'active'
    ),
    (
      'Data Science Research Assistant', 
      'DataMinds Research', 
      'Work with our data scientists to analyze complex datasets and develop insights.', 
      'New York, NY', 
      'Statistics background, some experience with Python or R', 
      '12 weeks', 
      (CURRENT_DATE + INTERVAL '45 days')::DATE, 
      (CURRENT_DATE + INTERVAL '60 days')::DATE, 
      (CURRENT_DATE + INTERVAL '144 days')::DATE, 
      5, 
      0, 
      'active'
    ),
    (
      'Robotics Engineering Intern', 
      'Future Robotics', 
      'Help design and build the next generation of autonomous robots.', 
      'Boston, MA', 
      'Interest in robotics, basic electronics knowledge', 
      '10 weeks', 
      (CURRENT_DATE + INTERVAL '15 days')::DATE, 
      (CURRENT_DATE + INTERVAL '30 days')::DATE, 
      (CURRENT_DATE + INTERVAL '100 days')::DATE, 
      8, 
      0, 
      'active'
    );
  END IF;
END $$;

-- Output the tables we've created or verified
SELECT 'Applications table is ready' AS status;
SELECT 'Internship_applications table is ready' AS status;
SELECT COUNT(*) AS internship_count FROM internships;
