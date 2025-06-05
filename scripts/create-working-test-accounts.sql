-- Create working test accounts
-- This script creates test accounts that will definitely work

BEGIN;

-- First, let's create the profiles directly (in case auth.users doesn't exist yet)
-- We'll use fixed UUIDs for consistency

-- Delete existing test accounts if they exist
DELETE FROM public.profiles WHERE email IN ('student@test.com', 'teacher@test.com', 'admin@test.com');

-- Create test profiles
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    grade,
    country,
    state,
    school_name,
    email_verified,
    created_at,
    updated_at
) VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'student@test.com',
    'Test Student',
    'student',
    7,
    'United States',
    'California',
    'Test Middle School',
    true,
    NOW(),
    NOW()
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'teacher@test.com',
    'Test Teacher',
    'teacher',
    NULL,
    'United States',
    'California',
    'Test Middle School',
    true,
    NOW(),
    NOW()
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'admin@test.com',
    'Test Admin',
    'admin',
    NULL,
    'United States',
    'California',
    NULL,
    true,
    NOW(),
    NOW()
);

-- Create parent info for the test student
INSERT INTO public.parent_info (
    student_id,
    parent_name,
    parent_email,
    parent_phone,
    relationship
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Test Parent',
    'parent@test.com',
    '(555) 123-4567',
    'mother'
);

-- Create some test activities
INSERT INTO public.user_activities (
    user_id,
    activity_type,
    activity_description,
    metadata
) VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'account_created',
    'Test student account created',
    '{"role": "student", "grade": 7}'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'account_created',
    'Test teacher account created',
    '{"role": "teacher"}'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'account_created',
    'Test admin account created',
    '{"role": "admin"}'
);

-- Create a test application
INSERT INTO public.internship_applications (
    internship_id,
    student_id,
    application_text,
    status,
    applied_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'I am very interested in this engineering program because I love building things and want to learn more about robotics and programming.',
    'pending',
    NOW()
);

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Test accounts created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Test Credentials:';
    RAISE NOTICE '   Student: student@test.com / TestStudent123!';
    RAISE NOTICE '   Teacher: teacher@test.com / TestTeacher123!';
    RAISE NOTICE '   Admin: admin@test.com / TestAdmin123!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Test data includes:';
    RAISE NOTICE '   - Student profile with parent info';
    RAISE NOTICE '   - Teacher and admin profiles';
    RAISE NOTICE '   - Sample internship application';
    RAISE NOTICE '   - User activity logs';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Important: You still need to create these users in Supabase Auth';
    RAISE NOTICE '   Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '   Create users with the emails above and set their passwords';
END $$;
