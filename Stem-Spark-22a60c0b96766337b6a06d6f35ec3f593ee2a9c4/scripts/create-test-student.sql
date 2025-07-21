-- Create a test student account for testing internship applications
DO $$
DECLARE
  student_id UUID := gen_random_uuid();
BEGIN
  -- Create a test student account with proper UUID
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

  -- Create corresponding profile
  INSERT INTO profiles (
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
  ) VALUES (
    student_id,
    'student@test.com',
    'Alex Johnson',
    'student',
    7,
    'United States',
    'California',
    'Lincoln Middle School',
    true,
    NOW(),
    NOW()
  );

  -- Create parent info
  INSERT INTO parent_info (
    student_id,
    parent_name,
    parent_email,
    parent_phone,
    relationship,
    created_at,
    updated_at
  ) VALUES (
    student_id,
    'Sarah Johnson',
    'sarah.johnson@email.com',
    '(555) 123-4567',
    'mother',
    NOW(),
    NOW()
  );

  -- Log activity
  INSERT INTO user_activities (
    user_id,
    activity_type,
    activity_description,
    metadata,
    created_at
  ) VALUES (
    student_id,
    'account_created',
    'Test student account created',
    '{"email": "student@test.com", "full_name": "Alex Johnson", "role": "student", "grade": 7}'::jsonb,
    NOW()
  );

  RAISE NOTICE 'Created test student with ID: %s', student_id;
END $$;

-- Verify student account was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.grade,
  p.school_name,
  pi.parent_name,
  pi.parent_email
FROM profiles p
LEFT JOIN parent_info pi ON p.id = pi.student_id
WHERE p.email = 'student@test.com';
