-- Create test accounts for different roles
DO $$
DECLARE
    student_id UUID := '30000000-0000-0000-0000-000000000001';
    teacher_id UUID := '30000000-0000-0000-0000-000000000002';
BEGIN
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
        aud
    ) VALUES (
        student_id,
        '00000000-0000-0000-0000-000000000000',
        'student@test.com',
        crypt('TestStudent123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW(),
        updated_at = NOW();

    -- Create test teacher account
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        teacher_id,
        '00000000-0000-0000-0000-000000000000',
        'teacher@test.com',
        crypt('TestTeacher123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW(),
        updated_at = NOW();

    -- Create profiles
    INSERT INTO profiles (id, email, full_name, role, grade, country, state, school_name, email_verified) VALUES
    (student_id, 'student@test.com', 'Test Student', 'student', 7, 'United States', 'California', 'Test Middle School', true),
    (teacher_id, 'teacher@test.com', 'Test Teacher', 'teacher', null, 'United States', 'New York', 'Test High School', true)
    ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        grade = EXCLUDED.grade,
        country = EXCLUDED.country,
        state = EXCLUDED.state,
        school_name = EXCLUDED.school_name,
        email_verified = EXCLUDED.email_verified,
        updated_at = NOW();

    -- Create parent info for student
    INSERT INTO parent_info (student_id, parent_name, parent_email, parent_phone, relationship) VALUES
    (student_id, 'Test Parent', 'parent@test.com', '(555) 123-4567', 'mother')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Test accounts created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST CREDENTIALS:';
    RAISE NOTICE '   Student: student@test.com / TestStudent123!';
    RAISE NOTICE '   Teacher: teacher@test.com / TestTeacher123!';
END $$;
