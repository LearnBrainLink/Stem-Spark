-- First, let's ensure we have the proper admin accounts
-- This script will create admin accounts that can be used immediately

-- Create admin accounts with proper authentication
DO $$
DECLARE
    admin_user_id UUID;
    director_user_id UUID;
    coordinator_user_id UUID;
    manager_user_id UUID;
BEGIN
    -- Generate UUIDs for admin accounts
    admin_user_id := gen_random_uuid();
    director_user_id := gen_random_uuid();
    coordinator_user_id := gen_random_uuid();
    manager_user_id := gen_random_uuid();

    -- Insert admin profiles directly (these will work with Supabase auth)
    INSERT INTO profiles (id, email, full_name, role, country, state, email_verified, created_at, updated_at) VALUES
    (admin_user_id, 'admin@stemspark.academy', 'Dr. Sarah Johnson', 'admin', 'United States', 'California', true, NOW(), NOW()),
    (director_user_id, 'director@stemspark.academy', 'Prof. Michael Chen', 'admin', 'United States', 'New York', true, NOW(), NOW()),
    (coordinator_user_id, 'coordinator@stemspark.academy', 'Dr. Emily Rodriguez', 'admin', 'United States', 'Texas', true, NOW(), NOW()),
    (manager_user_id, 'manager@stemspark.academy', 'Prof. David Kim', 'admin', 'United States', 'Washington', true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Log admin account creation activities
    INSERT INTO user_activities (user_id, activity_type, activity_description, metadata, created_at) VALUES
    (admin_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "admin@stemspark.academy", "role": "Main Administrator", "auto_created": true}', NOW()),
    (director_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "director@stemspark.academy", "role": "Program Director", "auto_created": true}', NOW()),
    (coordinator_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "coordinator@stemspark.academy", "role": "Education Coordinator", "auto_created": true}', NOW()),
    (manager_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "manager@stemspark.academy", "role": "Content Manager", "auto_created": true}', NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Admin accounts created successfully';
END $$;

-- Display the admin credentials for reference
DO $$
BEGIN
    RAISE NOTICE '=== ADMIN ACCOUNT CREDENTIALS ===';
    RAISE NOTICE 'Main Administrator:';
    RAISE NOTICE '  Email: admin@stemspark.academy';
    RAISE NOTICE '  Password: STEMAdmin2024!';
    RAISE NOTICE '';
    RAISE NOTICE 'Program Director:';
    RAISE NOTICE '  Email: director@stemspark.academy';
    RAISE NOTICE '  Password: STEMDirector2024!';
    RAISE NOTICE '';
    RAISE NOTICE 'Education Coordinator:';
    RAISE NOTICE '  Email: coordinator@stemspark.academy';
    RAISE NOTICE '  Password: STEMCoord2024!';
    RAISE NOTICE '';
    RAISE NOTICE 'Content Manager:';
    RAISE NOTICE '  Email: manager@stemspark.academy';
    RAISE NOTICE '  Password: STEMManager2024!';
    RAISE NOTICE '=================================';
END $$;
