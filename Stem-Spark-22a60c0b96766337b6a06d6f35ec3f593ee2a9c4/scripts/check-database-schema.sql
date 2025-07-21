-- Check database schema and tables
DO $$
DECLARE
    schema_exists BOOLEAN;
    table_exists BOOLEAN;
BEGIN
    -- Check if auth schema exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
    ) INTO schema_exists;
    
    IF schema_exists THEN
        RAISE NOTICE 'Auth schema exists: ✅';
    ELSE
        RAISE NOTICE 'Auth schema does not exist: ❌';
    END IF;
    
    -- Check if auth.users table exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Auth.users table exists: ✅';
    ELSE
        RAISE NOTICE 'Auth.users table does not exist: ❌';
    END IF;
    
    -- Check if profiles table exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Profiles table exists: ✅';
        
        -- Check profiles table structure
        RAISE NOTICE 'Profiles table columns:';
        FOR r IN (
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles'
            ORDER BY ordinal_position
        ) LOOP
            RAISE NOTICE '  - % (%)', r.column_name, r.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'Profiles table does not exist: ❌';
    END IF;
    
    -- Check if internships table exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'internships'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Internships table exists: ✅';
    ELSE
        RAISE NOTICE 'Internships table does not exist: ❌';
    END IF;
    
    -- Check if applications table exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'applications'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Applications table exists: ✅';
    ELSE
        RAISE NOTICE 'Applications table does not exist: ❌';
    END IF;
END $$;

-- Count records in key tables
SELECT 'profiles' AS table_name, COUNT(*) AS record_count FROM profiles
UNION ALL
SELECT 'internships' AS table_name, COUNT(*) AS record_count FROM internships
UNION ALL
SELECT 'applications' AS table_name, COUNT(*) AS record_count FROM applications
UNION ALL
SELECT 'parent_info' AS table_name, COUNT(*) AS record_count FROM parent_info
UNION ALL
SELECT 'user_activities' AS table_name, COUNT(*) AS record_count FROM user_activities
ORDER BY table_name;
