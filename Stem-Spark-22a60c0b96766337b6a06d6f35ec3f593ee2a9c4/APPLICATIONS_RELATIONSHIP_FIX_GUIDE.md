# 🔗 Applications Relationship Fix Guide

## 🔍 Issue Diagnosis
The applications page is failing with: "Could not find a relationship between 'internship_applications' and 'profiles' in the schema cache". This happens when the foreign key relationships between tables are missing or incorrectly configured.

## ✅ Quick Fix (3 minutes)

### Step 1: Fix Database Relationships
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Copy and run this SQL script:

```sql
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

        -- Enable RLS and create policies
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (true);
        CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated USING (true);

        RAISE NOTICE 'Profiles table created successfully.';
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

        -- Enable RLS and create policies
        ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "internships_select_policy" ON public.internships FOR SELECT TO authenticated USING (true);
        CREATE POLICY "internships_insert_policy" ON public.internships FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "internships_update_policy" ON public.internships FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "internships_delete_policy" ON public.internships FOR DELETE TO authenticated USING (true);

        RAISE NOTICE 'Internships table created successfully.';
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
    END IF;

    -- Fix foreign key constraints
    RAISE NOTICE 'Fixing foreign key constraints...';

    -- Drop existing constraints to avoid conflicts
    BEGIN
        ALTER TABLE public.internship_applications DROP CONSTRAINT IF EXISTS internship_applications_internship_id_fkey;
        ALTER TABLE public.internship_applications DROP CONSTRAINT IF EXISTS internship_applications_student_id_fkey;
        ALTER TABLE public.internship_applications DROP CONSTRAINT IF EXISTS internship_applications_reviewed_by_fkey;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Some constraints may not have existed: %', SQLERRM;
    END;

    -- Add proper foreign key constraints
    ALTER TABLE public.internship_applications 
    ADD CONSTRAINT internship_applications_internship_id_fkey 
    FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE;

    ALTER TABLE public.internship_applications 
    ADD CONSTRAINT internship_applications_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.internship_applications 
    ADD CONSTRAINT internship_applications_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

    -- Enable RLS and create policies for internship_applications
    ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "internship_applications_select_policy" ON public.internship_applications;
    DROP POLICY IF EXISTS "internship_applications_insert_policy" ON public.internship_applications;
    DROP POLICY IF EXISTS "internship_applications_update_policy" ON public.internship_applications;
    DROP POLICY IF EXISTS "internship_applications_delete_policy" ON public.internship_applications;

    CREATE POLICY "internship_applications_select_policy" ON public.internship_applications FOR SELECT TO authenticated USING (true);
    CREATE POLICY "internship_applications_insert_policy" ON public.internship_applications FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "internship_applications_update_policy" ON public.internship_applications FOR UPDATE TO authenticated USING (true);
    CREATE POLICY "internship_applications_delete_policy" ON public.internship_applications FOR DELETE TO authenticated USING (true);

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_internship_applications_internship_id ON public.internship_applications(internship_id);
    CREATE INDEX IF NOT EXISTS idx_internship_applications_student_id ON public.internship_applications(student_id);
    CREATE INDEX IF NOT EXISTS idx_internship_applications_status ON public.internship_applications(status);
    CREATE INDEX IF NOT EXISTS idx_internship_applications_applied_at ON public.internship_applications(applied_at);

    RAISE NOTICE 'Applications relationship fix completed successfully!';
END $$;
```

### Step 2: Test Applications Page
1. Go to Admin → Applications
2. The page should now load successfully and display applications

## 🔧 What This Fix Does

The SQL script:
- ✅ **Creates missing tables** (profiles, internships, internship_applications) if they don't exist
- ✅ **Adds proper foreign key relationships** between tables
- ✅ **Enables Row Level Security** with appropriate policies
- ✅ **Creates performance indexes** for faster queries
- ✅ **Handles naming conflicts** by dropping existing constraints first

## 🛠️ Code Improvements Made

I've also enhanced the applications data fetching with:
- **Multi-fallback approach**: Tries 3 different query methods
- **Better error handling**: Specific error messages for different failure types
- **Manual relationship fetching**: Falls back to individual queries if relationships fail
- **Enhanced logging**: Detailed console output for debugging

## 📊 Expected Results

After running the fix, you should see:
1. ✅ Applications page loads without errors
2. ✅ Student information displays correctly
3. ✅ Internship details show properly
4. ✅ Application status and dates are visible
5. ✅ All CRUD operations work (create, read, update, delete)

## 🔍 Troubleshooting

### Issue: "Table does not exist" errors
**Solution:** The SQL script will create missing tables automatically

### Issue: "Permission denied" errors  
**Solution:** The script creates proper RLS policies for all tables

### Issue: Still getting relationship errors
**Solution:** The enhanced code now has fallback logic that works even without relationships

### Issue: Empty applications list
**Solution:** You may need to create some test data:

```sql
-- Create test data (optional)
INSERT INTO profiles (email, full_name, role, grade, school_name) VALUES
('student@test.com', 'Test Student', 'student', 8, 'Test School');

INSERT INTO internships (title, company, description, location) VALUES
('Web Development Intern', 'Tech Corp', 'Learn web development', 'Remote');

INSERT INTO internship_applications (internship_id, student_id, application_text, status) VALUES
((SELECT id FROM internships LIMIT 1), (SELECT id FROM profiles LIMIT 1), 'I am interested in this internship', 'pending');
```

## 📁 Files Created/Updated
1. **`scripts/fix-applications-relationships.sql`** - Database relationship fix
2. **`app/admin/enhanced-actions.ts`** - Enhanced with fallback logic
3. **`APPLICATIONS_RELATIONSHIP_FIX_GUIDE.md`** - This guide

## 🚀 Next Steps
1. Run the SQL script in your Supabase Dashboard
2. Test the applications page - it should work immediately
3. If you need test data, run the optional test data SQL above

The applications page will now work correctly with proper relationships and fallback handling for maximum reliability. 