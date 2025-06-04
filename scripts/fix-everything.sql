-- Create admin accounts with proper setup
DO $$
DECLARE
    admin_user_id UUID := '11111111-1111-1111-1111-111111111111';
    director_user_id UUID := '22222222-2222-2222-2222-222222222222';
    coordinator_user_id UUID := '33333333-3333-3333-3333-333333333333';
    manager_user_id UUID := '44444444-4444-4444-4444-444444444444';
    admin_emails TEXT[] := ARRAY['admin@stemspark.academy', 'director@stemspark.academy', 'coordinator@stemspark.academy', 'manager@stemspark.academy'];
    user_ids_to_delete UUID[];
    internship_ids_to_delete UUID[];
BEGIN
    -- Collect IDs of admin users from profiles table that are about to be deleted
    SELECT ARRAY_AGG(id) INTO user_ids_to_delete
    FROM profiles
    WHERE email = ANY(admin_emails);

    -- Collect IDs of internships created by these admin users
    IF array_length(user_ids_to_delete, 1) IS NOT NULL THEN
        SELECT ARRAY_AGG(id) INTO internship_ids_to_delete
        FROM internships
        WHERE created_by = ANY(user_ids_to_delete);
        RAISE NOTICE 'Collected internship IDs to delete.';
    END IF;

    -- 1. Delete associated user activities first to satisfy foreign key constraints (profiles -> user_activities)
    IF array_length(user_ids_to_delete, 1) IS NOT NULL THEN
        DELETE FROM user_activities
        WHERE user_id = ANY(user_ids_to_delete);
        RAISE NOTICE 'Deleted user activities for admin accounts.';
    END IF;

    -- 2. Delete applications related to internships created by these admin users (internships -> applications)
    -- This is crucial to prevent foreign key violation on 'applications' table
    IF array_length(internship_ids_to_delete, 1) IS NOT NULL THEN
        DELETE FROM internship_applications
        WHERE internship_id = ANY(internship_ids_to_delete);
        RAISE NOTICE 'Deleted internship_applications related to admin-created internships.';
        -- Also try 'applications' table if it exists and is used
        DELETE FROM applications
        WHERE internship_id = ANY(internship_ids_to_delete);
        RAISE NOTICE 'Deleted applications related to admin-created internships (if applications table exists).';
    END IF;

    -- 3. Delete internships created by these admin users (profiles -> internships)
    IF array_length(user_ids_to_delete, 1) IS NOT NULL THEN
        DELETE FROM internships
        WHERE created_by = ANY(user_ids_to_delete);
        RAISE NOTICE 'Deleted internships created by admin accounts.';
    END IF;

    -- 4. Delete profiles next
    DELETE FROM profiles WHERE email = ANY(admin_emails);
    RAISE NOTICE 'Deleted profiles for admin accounts.';

    -- 5. Delete auth.users last (this will also trigger cascades if set up correctly)
    DELETE FROM auth.users WHERE email = ANY(admin_emails);
    RAISE NOTICE 'Deleted auth.users entries for admin accounts.';

    -- FIXED: Create auth.users entries FIRST (before profiles)
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
      admin_user_id,
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
    ) ON CONFLICT (id) DO UPDATE SET
      encrypted_password = EXCLUDED.encrypted_password,
      updated_at = NOW();

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
      director_user_id,
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
    ) ON CONFLICT (id) DO UPDATE SET
      encrypted_password = EXCLUDED.encrypted_password,
      updated_at = NOW();

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
      coordinator_user_id,
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
    ) ON CONFLICT (id) DO UPDATE SET
      encrypted_password = EXCLUDED.encrypted_password,
      updated_at = NOW();

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
      manager_user_id,
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
    ) ON CONFLICT (id) DO UPDATE SET
      encrypted_password = EXCLUDED.encrypted_password,
      updated_at = NOW();

    -- NOW insert admin profiles (after auth.users exist)
    INSERT INTO profiles (id, email, full_name, role, country, state, email_verified, created_at, updated_at) VALUES
    (admin_user_id, 'admin@stemspark.academy', 'Dr. Sarah Johnson', 'admin', 'United States', 'California', true, NOW(), NOW()),
    (director_user_id, 'director@stemspark.academy', 'Prof. Michael Chen', 'admin', 'United States', 'New York', true, NOW(), NOW()),
    (coordinator_user_id, 'coordinator@stemspark.academy', 'Dr. Emily Rodriguez', 'admin', 'United States', 'Texas', true, NOW(), NOW()),
    (manager_user_id, 'manager@stemspark.academy', 'Prof. David Kim', 'admin', 'United States', 'Washington', true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        country = EXCLUDED.country,
        state = EXCLUDED.state,
        email_verified = EXCLUDED.email_verified,
        updated_at = NOW();

    -- Log admin account creation activities
    INSERT INTO user_activities (user_id, activity_type, activity_description, metadata, created_at) VALUES
    (admin_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "admin@stemspark.academy", "full_name": "Dr. Sarah Johnson", "role": "admin", "auto_created": true}'::jsonb, NOW()),
    (director_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "director@stemspark.academy", "full_name": "Prof. Michael Chen", "role": "admin", "auto_created": true}'::jsonb, NOW()),
    (coordinator_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "coordinator@stemspark.academy", "full_name": "Dr. Emily Rodriguez", "role": "admin", "auto_created": true}'::jsonb, NOW()),
    (manager_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "manager@stemspark.academy", "full_name": "Prof. David Kim", "role": "admin", "auto_created": true}'::jsonb, NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Admin accounts setup completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 ADMIN CREDENTIALS:';
    RAISE NOTICE '   Admin: admin@stemspark.academy / STEMAdmin2024!';
    RAISE NOTICE '   Director: director@stemspark.academy / STEMDirector2024!';
    RAISE NOTICE '   Coordinator: coordinator@stemspark.academy / STEMCoord2024!';
    RAISE NOTICE '   Manager: manager@stemspark.academy / STEMManager2024!';
END $$;
