-- Check and fix database schema issues
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check if profiles table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'profiles'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creating profiles table';
        
        EXECUTE '
        CREATE TABLE profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE,
          email TEXT NOT NULL,
          full_name TEXT NOT NULL,
          role TEXT DEFAULT ''student'' CHECK (role IN (''student'', ''teacher'', ''parent'', ''admin'')),
          grade INTEGER CHECK (grade BETWEEN 5 AND 8),
          country TEXT,
          state TEXT,
          school_name TEXT,
          email_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (id)
        )';
        
        RAISE NOTICE 'Profiles table created';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
    
    -- Check if internships table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'internships'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creating internships table';
        
        EXECUTE '
        CREATE TABLE internships (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          duration TEXT NOT NULL,
          requirements TEXT,
          application_deadline DATE NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          max_participants INTEGER DEFAULT 10,
          current_participants INTEGER DEFAULT 0,
          created_by UUID REFERENCES profiles(id),
          status TEXT DEFAULT ''active'' CHECK (status IN (''active'', ''inactive'', ''completed'')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )';
        
        RAISE NOTICE 'Internships table created';
    ELSE
        RAISE NOTICE 'Internships table already exists';
    END IF;
    
    -- Check if internship_applications table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'internship_applications'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creating internship_applications table';
        
        EXECUTE '
        CREATE TABLE internship_applications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
          student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          application_text TEXT NOT NULL,
          status TEXT DEFAULT ''pending'' CHECK (status IN (''pending'', ''approved'', ''rejected'', ''withdrawn'')),
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(internship_id, student_id)
        )';
        
        RAISE NOTICE 'Internship_applications table created';
    ELSE
        RAISE NOTICE 'Internship_applications table already exists';
    END IF;
    
    RAISE NOTICE 'Database schema check completed';
END $$;
