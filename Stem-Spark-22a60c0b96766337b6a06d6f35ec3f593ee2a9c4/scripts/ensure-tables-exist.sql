-- Create function to check if tables exist and create them if they don't
CREATE OR REPLACE FUNCTION create_applications_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if internship_applications table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'internship_applications') THEN
        CREATE TABLE internship_applications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            internship_id UUID NOT NULL,
            student_id UUID NOT NULL,
            application_text TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created internship_applications table';
    END IF;
    
    -- Check if applications table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'applications') THEN
        CREATE TABLE applications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            internship_id UUID NOT NULL,
            student_id UUID NOT NULL,
            student_statement TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created applications table';
    END IF;
    
    -- Check if user_activities table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_activities') THEN
        CREATE TABLE user_activities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            activity_type TEXT NOT NULL,
            activity_description TEXT NOT NULL,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created user_activities table';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_applications_table_if_not_exists();

-- Create test internship if none exist
DO $$
DECLARE
    internship_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO internship_count FROM internships;
    
    IF internship_count = 0 THEN
        INSERT INTO internships (
            id, 
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
            status, 
            created_at, 
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Summer Research Internship',
            'STEM Research Institute',
            'Join our summer research program and work alongside leading scientists on cutting-edge projects.',
            'Boston, MA',
            'Current undergraduate student in a STEM field. Basic lab experience preferred.',
            '10 weeks',
            (CURRENT_DATE + INTERVAL '30 days')::DATE,
            (CURRENT_DATE + INTERVAL '60 days')::DATE,
            (CURRENT_DATE + INTERVAL '130 days')::DATE,
            15,
            0,
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created test internship';
    END IF;
END $$;

-- Output success message
SELECT 'Database tables verified and created if needed' AS status;
