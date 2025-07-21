-- Fix Applications Relationships Issue
-- This script fixes the relationship between internship_applications and profiles tables

DO $$
BEGIN
    RAISE NOTICE 'Starting applications relationship fix...';

    -- Check if profiles table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'Profiles table does not exist. Creating it...';
        
        -- Create profiles table
        CREATE TABLE public.profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'student' CHECK (role IN ('student', 'parent', 'teacher', 'admin')),
            grade INTEGER,
            school_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (true);
        CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated USING (true);

        RAISE NOTICE 'Profiles table created successfully.';
    ELSE
        RAISE NOTICE 'Profiles table already exists.';
        
        -- Add missing columns to profiles table if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name' AND table_schema = 'public') THEN
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
            RAISE NOTICE 'Added full_name column to profiles table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public') THEN
            ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('student', 'parent', 'teacher', 'admin'));
            RAISE NOTICE 'Added role column to profiles table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'grade' AND table_schema = 'public') THEN
            ALTER TABLE public.profiles ADD COLUMN grade INTEGER;
            RAISE NOTICE 'Added grade column to profiles table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'school_name' AND table_schema = 'public') THEN
            ALTER TABLE public.profiles ADD COLUMN school_name TEXT;
            RAISE NOTICE 'Added school_name column to profiles table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to profiles table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at' AND table_schema = 'public') THEN
            ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to profiles table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column to profiles table.';
        END IF;
    END IF;

    -- Check if internships table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internships' AND table_schema = 'public') THEN
        RAISE NOTICE 'Internships table does not exist. Creating it...';
        
        -- Create internships table
        CREATE TABLE public.internships (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT,
            location TEXT,
            duration TEXT,
            application_deadline DATE,
            start_date DATE,
            end_date DATE,
            max_participants INTEGER DEFAULT 10,
            current_participants INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
            created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "internships_select_policy" ON public.internships FOR SELECT TO authenticated USING (true);
        CREATE POLICY "internships_insert_policy" ON public.internships FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "internships_update_policy" ON public.internships FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "internships_delete_policy" ON public.internships FOR DELETE TO authenticated USING (true);

        RAISE NOTICE 'Internships table created successfully.';
    ELSE
        RAISE NOTICE 'Internships table already exists.';
    END IF;

    -- Check if internship_applications table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internship_applications' AND table_schema = 'public') THEN
        RAISE NOTICE 'Internship_applications table does not exist. Creating it...';
        
        -- Create internship_applications table
        CREATE TABLE public.internship_applications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            internship_id UUID NOT NULL,
            student_id UUID NOT NULL,
            application_text TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            reviewed_at TIMESTAMP WITH TIME ZONE,
            reviewed_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(internship_id, student_id)
        );

        RAISE NOTICE 'Internship_applications table created successfully.';
    ELSE
        RAISE NOTICE 'Internship_applications table already exists.';
        
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_applications' AND column_name = 'reviewed_at' AND table_schema = 'public') THEN
            ALTER TABLE public.internship_applications ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added reviewed_at column to internship_applications table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_applications' AND column_name = 'reviewed_by' AND table_schema = 'public') THEN
            ALTER TABLE public.internship_applications ADD COLUMN reviewed_by UUID;
            RAISE NOTICE 'Added reviewed_by column to internship_applications table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_applications' AND column_name = 'created_at' AND table_schema = 'public') THEN
            ALTER TABLE public.internship_applications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to internship_applications table.';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_applications' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            ALTER TABLE public.internship_applications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column to internship_applications table.';
        END IF;
    END IF;

    -- Now add/fix foreign key constraints
    RAISE NOTICE 'Fixing foreign key constraints...';

    -- Drop existing foreign key constraints if they exist (to avoid conflicts)
    BEGIN
        -- Drop constraints one by one to handle individual failures gracefully
        BEGIN
            ALTER TABLE public.internship_applications DROP CONSTRAINT IF EXISTS internship_applications_internship_id_fkey;
            RAISE NOTICE 'Dropped internship_id foreign key constraint if it existed.';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop internship_id constraint: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE public.internship_applications DROP CONSTRAINT IF EXISTS internship_applications_student_id_fkey;
            RAISE NOTICE 'Dropped student_id foreign key constraint if it existed.';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop student_id constraint: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE public.internship_applications DROP CONSTRAINT IF EXISTS internship_applications_reviewed_by_fkey;
            RAISE NOTICE 'Dropped reviewed_by foreign key constraint if it existed.';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop reviewed_by constraint: %', SQLERRM;
        END;
    END;

    -- Add proper foreign key constraints
    ALTER TABLE public.internship_applications 
    ADD CONSTRAINT internship_applications_internship_id_fkey 
    FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE;

    ALTER TABLE public.internship_applications 
    ADD CONSTRAINT internship_applications_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- Only add reviewed_by constraint if the column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internship_applications' AND column_name = 'reviewed_by' AND table_schema = 'public') THEN
        ALTER TABLE public.internship_applications 
        ADD CONSTRAINT internship_applications_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added reviewed_by foreign key constraint.';
    ELSE
        RAISE NOTICE 'Skipped reviewed_by foreign key constraint (column does not exist).';
    END IF;

    RAISE NOTICE 'Foreign key constraints added successfully.';

    -- Enable RLS on internship_applications if not already enabled
    ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for internship_applications
    DROP POLICY IF EXISTS "internship_applications_select_policy" ON public.internship_applications;
    DROP POLICY IF EXISTS "internship_applications_insert_policy" ON public.internship_applications;
    DROP POLICY IF EXISTS "internship_applications_update_policy" ON public.internship_applications;
    DROP POLICY IF EXISTS "internship_applications_delete_policy" ON public.internship_applications;

    CREATE POLICY "internship_applications_select_policy" ON public.internship_applications 
    FOR SELECT TO authenticated USING (true);

    CREATE POLICY "internship_applications_insert_policy" ON public.internship_applications 
    FOR INSERT TO authenticated WITH CHECK (true);

    CREATE POLICY "internship_applications_update_policy" ON public.internship_applications 
    FOR UPDATE TO authenticated USING (true);

    CREATE POLICY "internship_applications_delete_policy" ON public.internship_applications 
    FOR DELETE TO authenticated USING (true);

    RAISE NOTICE 'RLS policies created successfully.';

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_internship_applications_internship_id ON public.internship_applications(internship_id);
    CREATE INDEX IF NOT EXISTS idx_internship_applications_student_id ON public.internship_applications(student_id);
    CREATE INDEX IF NOT EXISTS idx_internship_applications_status ON public.internship_applications(status);
    CREATE INDEX IF NOT EXISTS idx_internship_applications_applied_at ON public.internship_applications(applied_at);

    RAISE NOTICE 'Indexes created successfully.';

    RAISE NOTICE 'Applications relationship fix completed successfully!';

END $$;

-- Display final table relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'internship_applications'
ORDER BY tc.table_name, kcu.ordinal_position; 