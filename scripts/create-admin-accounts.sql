-- Create 4 pre-existing admin accounts
-- These accounts will be created with verified email status

-- Admin Account 1: Main Administrator
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@stemspark.academy',
  crypt('STEMAdmin2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- Admin Account 2: Program Director
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'director@stemspark.academy',
  crypt('STEMDirector2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- Admin Account 3: Education Coordinator
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'coordinator@stemspark.academy',
  crypt('STEMCoord2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- Admin Account 4: Content Manager
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'manager@stemspark.academy',
  crypt('STEMManager2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- Create corresponding profiles for each admin
INSERT INTO profiles (id, email, full_name, role, country, state, email_verified, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email = 'admin@stemspark.academy' THEN 'Dr. Sarah Johnson'
    WHEN u.email = 'director@stemspark.academy' THEN 'Prof. Michael Chen'
    WHEN u.email = 'coordinator@stemspark.academy' THEN 'Dr. Emily Rodriguez'
    WHEN u.email = 'manager@stemspark.academy' THEN 'Prof. David Kim'
  END as full_name,
  'admin' as role,
  'United States' as country,
  CASE 
    WHEN u.email = 'admin@stemspark.academy' THEN 'California'
    WHEN u.email = 'director@stemspark.academy' THEN 'New York'
    WHEN u.email = 'coordinator@stemspark.academy' THEN 'Texas'
    WHEN u.email = 'manager@stemspark.academy' THEN 'Washington'
  END as state,
  true as email_verified,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE u.email IN (
  'admin@stemspark.academy',
  'director@stemspark.academy', 
  'coordinator@stemspark.academy',
  'manager@stemspark.academy'
);

-- Log admin account creation activities
INSERT INTO user_activities (user_id, activity_type, activity_description, metadata, created_at)
SELECT 
  p.id,
  'admin_account_created',
  'Admin account created and configured',
  jsonb_build_object(
    'email', p.email,
    'full_name', p.full_name,
    'role', p.role,
    'auto_created', true
  ),
  NOW()
FROM profiles p
WHERE p.role = 'admin' AND p.email LIKE '%@stemspark.academy';
