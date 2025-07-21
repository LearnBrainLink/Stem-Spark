-- Create test accounts for different roles
-- This script creates test users directly in Supabase auth

DO $$
DECLARE
    student_id UUID := '30000000-0000-0000-0000-000000000001';
    intern_id UUID := '30000000-0000-0000-0000-000000000002';
    admin_id UUID := '30000000-0000-0000-0000-000000000003';
BEGIN
    -- Delete existing test accounts if they exist
    DELETE FROM auth.users WHERE email IN ('student@test.com', 'intern@test.com', 'admin@test.com');
    DELETE FROM profiles WHERE email IN ('student@test.com', 'intern@test.com', 'admin@test.com');

    -- Create test student account
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token
    ) VALUES (
        student_id,
        '00000000-0000-0000-0000-000000000000',
        'student@test.com',
        crypt('TestStudent123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        ''
    );

    -- Create test intern account
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token
    ) VALUES (
        intern_id,
        '00000000-0000-0000-0000-000000000000',
        'intern@test.com',
        crypt('TestIntern123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        ''
    );

    -- Create test admin account
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token
    ) VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@test.com',
        crypt('TestAdmin123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        ''
    );

    -- Create profiles for test accounts
    INSERT INTO profiles (id, email, full_name, role, grade, country, state, school_name, email_verified) VALUES
    (student_id, 'student@test.com', 'Test Student', 'student', 7, 'United States', 'California', 'Test Middle School', true),
    (intern_id, 'intern@test.com', 'Test Intern', 'intern', null, 'United States', 'New York', 'Test High School', true),
    (admin_id, 'admin@test.com', 'Test Admin', 'admin', null, 'United States', 'Texas', 'STEM Spark Academy', true);

    -- Create parent info for test student
    INSERT INTO parent_info (student_id, parent_name, parent_email, parent_phone, relationship) VALUES
    (student_id, 'Test Parent', 'parent@test.com', '(555) 123-4567', 'mother');

    -- Log activities for test accounts
    INSERT INTO user_activities (user_id, activity_type, activity_description, metadata) VALUES
    (student_id, 'account_created', 'Test student account created', '{"role": "student", "test_account": true}'),
    (intern_id, 'account_created', 'Test intern account created', '{"role": "intern", "test_account": true}'),
    (admin_id, 'account_created', 'Test admin account created', '{"role": "admin", "test_account": true}');

    RAISE NOTICE '✅ Test accounts created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST CREDENTIALS:';
    RAISE NOTICE '   Student: student@test.com / TestStudent123!';
    RAISE NOTICE '   Intern: intern@test.com / TestIntern123!';
    RAISE NOTICE '   Admin: admin@test.com / TestAdmin123!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 All accounts are pre-verified and ready to use!';
END $$;
