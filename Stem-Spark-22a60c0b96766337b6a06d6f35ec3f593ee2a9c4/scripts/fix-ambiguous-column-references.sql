-- Fix ambiguous column reference errors
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔧 Fixing ambiguous column reference errors...';
    
    -- Drop and recreate functions with explicit column references
    DROP FUNCTION IF EXISTS find_duplicate_emails();
    DROP FUNCTION IF EXISTS fix_duplicate_users();
    DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text);
    DROP FUNCTION IF EXISTS fix_policies();
    
    -- Create find_duplicate_emails function
    CREATE OR REPLACE FUNCTION find_duplicate_emails()
    RETURNS TABLE(email_address TEXT, count_duplicates BIGINT) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            u.email as email_address,
            COUNT(*) as count_duplicates
        FROM auth.users u
        GROUP BY u.email
        HAVING COUNT(*) > 1;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE '✅ Created find_duplicate_emails function';
    
    -- Create fix_duplicate_users function
    CREATE OR REPLACE FUNCTION fix_duplicate_users()
    RETURNS TEXT AS $$
    DECLARE
        duplicate_record RECORD;
        users_to_delete UUID[];
        deleted_count INTEGER := 0;
    BEGIN
        -- Find and fix duplicate users
        FOR duplicate_record IN 
            SELECT u.email as email_address
            FROM auth.users u
            GROUP BY u.email
            HAVING COUNT(*) > 1
        LOOP
            -- Get all user IDs for this email except the most recent one
            SELECT array_agg(u.id) INTO users_to_delete
            FROM (
                SELECT u.id, u.created_at
                FROM auth.users u
                WHERE u.email = duplicate_record.email_address
                ORDER BY u.created_at DESC
                OFFSET 1
            ) u;
            
            -- Delete duplicate users
            IF users_to_delete IS NOT NULL THEN
                DELETE FROM auth.users WHERE id = ANY(users_to_delete);
                deleted_count := deleted_count + array_length(users_to_delete, 1);
                
                RAISE NOTICE 'Removed % duplicate users for email: %', 
                    array_length(users_to_delete, 1), duplicate_record.email_address;
            END IF;
        END LOOP;
        
        RETURN format('Fixed %s duplicate users', deleted_count);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE '✅ Created fix_duplicate_users function';
    
    -- Create add_column_if_not_exists function
    CREATE OR REPLACE FUNCTION add_column_if_not_exists(
        table_name TEXT,
        column_name TEXT,
        column_type TEXT
    )
    RETURNS TEXT AS $$
    DECLARE
        column_exists BOOLEAN;
    BEGIN
        -- Check if column exists
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = add_column_if_not_exists.table_name
            AND column_name = add_column_if_not_exists.column_name
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
                table_name, column_name, column_type);
            RETURN format('Added column %s to table %s', column_name, table_name);
        ELSE
            RETURN format('Column %s already exists in table %s', column_name, table_name);
        END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE '✅ Created add_column_if_not_exists function';
    
    -- Create fix_policies function
    CREATE OR REPLACE FUNCTION fix_policies()
    RETURNS TEXT AS $$
    DECLARE
        policy_count INTEGER := 0;
    BEGIN
        -- Drop existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
        DROP POLICY IF EXISTS "Everyone can view active internships" ON internships;
        DROP POLICY IF EXISTS "Admins can manage internships" ON internships;
        DROP POLICY IF EXISTS "Users can view own applications" ON internship_applications;
        DROP POLICY IF EXISTS "Students can apply to internships" ON internship_applications;
        DROP POLICY IF EXISTS "Students can withdraw applications" ON internship_applications;
        
        -- Create policies for profiles
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = profiles.id);
        policy_count := policy_count + 1;
        
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = profiles.id);
        policy_count := policy_count + 1;
        
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = profiles.id);
        policy_count := policy_count + 1;
        
        CREATE POLICY "Admins can view all profiles" ON profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
        policy_count := policy_count + 1;
        
        -- Create policies for internships
        CREATE POLICY "Everyone can view active internships" ON internships
            FOR SELECT USING (internships.status = 'active');
        policy_count := policy_count + 1;
        
        CREATE POLICY "Admins can manage internships" ON internships
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
        policy_count := policy_count + 1;
        
        -- Create policies for internship applications
        CREATE POLICY "Users can view own applications" ON internship_applications
            FOR SELECT USING (
                internship_applications.student_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
        policy_count := policy_count + 1;
        
        CREATE POLICY "Students can apply to internships" ON internship_applications
            FOR INSERT WITH CHECK (internship_applications.student_id = auth.uid());
        policy_count := policy_count + 1;
        
        CREATE POLICY "Students can withdraw applications" ON internship_applications
            FOR UPDATE USING (internship_applications.student_id = auth.uid());
        policy_count := policy_count + 1;
        
        RETURN format('Created %s policies successfully', policy_count);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE '✅ Created fix_policies function';
    
    RAISE NOTICE '🎉 All SQL functions created successfully with explicit column references!';
END $$;
