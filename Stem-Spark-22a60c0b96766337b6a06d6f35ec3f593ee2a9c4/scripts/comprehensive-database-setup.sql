-- Comprehensive database setup script that handles all errors
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
    policy_exists BOOLEAN;
    policy_name TEXT;
    table_name TEXT;
BEGIN
    RAISE NOTICE '🚀 Starting comprehensive database setup...';
    
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
        -- Check if start_date column exists in internships table
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'internships'
            AND column_name = 'start_date'
        ) INTO column_exists;

        -- If column doesn't exist, add it
        IF NOT column_exists THEN
            RAISE NOTICE 'Adding start_date column to internships table';
            EXECUTE 'ALTER TABLE internships ADD COLUMN start_date DATE';
        ELSE
            RAISE NOTICE 'start_date column already exists in internships table';
        END IF;
        
        -- Check if end_date column exists
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'internships'
            AND column_name = 'end_date'
        ) INTO column_exists;

        -- If column doesn't exist, add it
        IF NOT column_exists THEN
            RAISE NOTICE 'Adding end_date column to internships table';
            EXECUTE 'ALTER TABLE internships ADD COLUMN end_date DATE';
        ELSE
            RAISE NOTICE 'end_date column already exists in internships table';
        END IF;
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
    
    -- Enable Row Level Security
    EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE internships ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY';
    
    -- Check if policy exists before creating
    FOR table_name IN SELECT unnest(ARRAY['profiles', 'internships', 'internship_applications']) LOOP
        FOR policy_name IN SELECT unnest(ARRAY[
            'Users can view own profile',
            'Users can update own profile',
            'Users can insert own profile',
            'Admins can view all profiles',
            'Everyone can view active internships',
            'Admins can manage internships',
            'Users can view own applications',
            'Students can apply to internships',
            'Students can withdraw applications'
        ]) LOOP
            -- Check if policy exists
            BEGIN
                EXECUTE format('
                    SELECT EXISTS (
                        SELECT 1
                        FROM pg_policies
                        WHERE tablename = %L
                        AND policyname = %L
                    )', table_name, policy_name)
                INTO policy_exists;
                
                IF policy_exists THEN
                    RAISE NOTICE 'Policy "%" already exists on table "%"', policy_name, table_name;
                    -- Drop existing policy to recreate it
                    EXECUTE format('DROP POLICY IF EXISTS "%s" ON %I', policy_name, table_name);
                    RAISE NOTICE 'Dropped policy "%" on table "%"', policy_name, table_name;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error checking policy "%" on table "%": %', policy_name, table_name, SQLERRM;
            END;
        END LOOP;
    END LOOP;
    
    -- Create policies for profiles
    BEGIN
        EXECUTE '
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id)';
        RAISE NOTICE 'Created policy "Users can view own profile" on profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Users can view own profile": %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE '
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id)';
        RAISE NOTICE 'Created policy "Users can update own profile" on profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Users can update own profile": %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE '
        CREATE POLICY "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id)';
        RAISE NOTICE 'Created policy "Users can insert own profile" on profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Users can insert own profile": %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE '
        CREATE POLICY "Admins can view all profiles" ON profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND role = ''admin''
            )
          )';
        RAISE NOTICE 'Created policy "Admins can view all profiles" on profiles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Admins can view all profiles": %', SQLERRM;
    END;
    
    -- Create policies for internships
    BEGIN
        EXECUTE '
        CREATE POLICY "Everyone can view active internships" ON internships
          FOR SELECT USING (status = ''active'')';
        RAISE NOTICE 'Created policy "Everyone can view active internships" on internships';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Everyone can view active internships": %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE '
        CREATE POLICY "Admins can manage internships" ON internships
          FOR ALL USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
          )';
        RAISE NOTICE 'Created policy "Admins can manage internships" on internships';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Admins can manage internships": %', SQLERRM;
    END;
    
    -- Create policies for internship applications
    BEGIN
        EXECUTE '
        CREATE POLICY "Users can view own applications" ON internship_applications
          FOR SELECT USING (
            student_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
          )';
        RAISE NOTICE 'Created policy "Users can view own applications" on internship_applications';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Users can view own applications": %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE '
        CREATE POLICY "Students can apply to internships" ON internship_applications
          FOR INSERT WITH CHECK (student_id = auth.uid())';
        RAISE NOTICE 'Created policy "Students can apply to internships" on internship_applications';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Students can apply to internships": %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE '
        CREATE POLICY "Students can withdraw applications" ON internship_applications
          FOR UPDATE USING (student_id = auth.uid())';
        RAISE NOTICE 'Created policy "Students can withdraw applications" on internship_applications';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy "Students can withdraw applications": %', SQLERRM;
    END;
    
    RAISE NOTICE '✅ Comprehensive database setup completed successfully!';
END $$;
