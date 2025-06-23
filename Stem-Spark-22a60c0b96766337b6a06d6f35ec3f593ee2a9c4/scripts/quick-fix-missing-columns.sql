-- Quick fix for missing columns in profiles table
-- Run this immediately to fix the "school_name does not exist" error

DO $$
BEGIN
    RAISE NOTICE 'Quick fix: Adding missing columns to profiles table...';

    -- Add school_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'school_name' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN school_name TEXT;
        RAISE NOTICE 'Added school_name column to profiles table.';
    ELSE
        RAISE NOTICE 'school_name column already exists.';
    END IF;

    -- Add grade column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'grade' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN grade INTEGER;
        RAISE NOTICE 'Added grade column to profiles table.';
    ELSE
        RAISE NOTICE 'grade column already exists.';
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column to profiles table.';
    ELSE
        RAISE NOTICE 'full_name column already exists.';
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('student', 'parent', 'teacher', 'admin'));
        RAISE NOTICE 'Added role column to profiles table.';
    ELSE
        RAISE NOTICE 'role column already exists.';
    END IF;

    RAISE NOTICE 'Quick fix completed successfully!';

END $$;

-- Show the current structure of profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position; 