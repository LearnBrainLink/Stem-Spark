-- Create admin accounts directly in auth.users table
DO $$
DECLARE
    admin_user_id UUID := '11111111-1111-1111-1111-111111111111';
    director_user_id UUID := '22222222-2222-2222-2222-222222222222';
    coordinator_user_id UUID := '33333333-3333-3333-3333-333333333333';
    manager_user_id UUID := '44444444-4444-4444-4444-444444444444';
    
    -- Check if we have the required columns in auth.users
    required_columns TEXT[];
    missing_columns TEXT[];
    column_exists BOOLEAN;
BEGIN
    -- Define required columns
    required_columns := ARRAY['id', 'email', 'encrypted_password', 'email_confirmed_at', 'role', 'aud'];
    missing_columns := '{}';
    
    -- Check each required column
    FOREACH column_name IN ARRAY required_columns
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = column_name
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            missing_columns := array_append(missing_columns, column_name);
        END IF;
    END LOOP;
    
    -- If any columns are missing, show error
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Missing columns in auth.users: %', missing_columns;
        RAISE EXCEPTION 'Cannot create admin accounts due to missing columns';
    END IF;

    -- First, clean up existing accounts
    DELETE FROM auth.users WHERE email IN (
        'admin@stemspark.academy',
        'director@stemspark.academy', 
        'coordinator@stemspark.academy',
        'manager@stemspark.academy'
    );
    
    DELETE FROM profiles WHERE email IN (
        'admin@stemspark.academy',
        'director@stemspark.academy', 
        'coordinator@stemspark.academy',
        'manager@stemspark.academy'
    );

    -- Create profiles first
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

    -- Create admin accounts with minimal required fields
    BEGIN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES
        (
            admin_user_id,
            'admin@stemspark.academy',
            crypt('STEMAdmin2024!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        ),
        (
            director_user_id,
            'director@stemspark.academy',
            crypt('STEMDirector2024!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        ),
        (
            coordinator_user_id,
            'coordinator@stemspark.academy',
            crypt('STEMCoord2024!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        ),
        (
            manager_user_id,
            'manager@stemspark.academy',
            crypt('STEMManager2024!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE '✅ Admin accounts created successfully!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error creating admin accounts: %', SQLERRM;
        
        -- Try alternative approach with different column set
        BEGIN
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                created_at,
                updated_at
            ) VALUES
            (
                admin_user_id,
                'admin@stemspark.academy',
                crypt('STEMAdmin2024!', gen_salt('bf')),
                NOW(),
                NOW()
            ),
            (
                director_user_id,
                'director@stemspark.academy',
                crypt('STEMDirector2024!', gen_salt('bf')),
                NOW(),
                NOW()
            ),
            (
                coordinator_user_id,
                'coordinator@stemspark.academy',
                crypt('STEMCoord2024!', gen_salt('bf')),
                NOW(),
                NOW()
            ),
            (
                manager_user_id,
                'manager@stemspark.academy',
                crypt('STEMManager2024!', gen_salt('bf')),
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '✅ Admin accounts created with minimal fields!';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Alternative approach also failed: %', SQLERRM;
        END;
    END;

    -- Log admin account creation activities
    INSERT INTO user_activities (user_id, activity_type, activity_description, metadata, created_at) VALUES
    (admin_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "admin@stemspark.academy", "full_name": "Dr. Sarah Johnson", "role": "admin", "auto_created": true}'::jsonb, NOW()),
    (director_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "director@stemspark.academy", "full_name": "Prof. Michael Chen", "role": "admin", "auto_created": true}'::jsonb, NOW()),
    (coordinator_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "coordinator@stemspark.academy", "full_name": "Dr. Emily Rodriguez", "role": "admin", "auto_created": true}'::jsonb, NOW()),
    (manager_user_id, 'admin_account_created', 'Admin account created and configured', '{"email": "manager@stemspark.academy", "full_name": "Prof. David Kim", "role": "admin", "auto_created": true}'::jsonb, NOW())
    ON CONFLICT DO NOTHING;
END $$;

-- Verify admin accounts in profiles table
SELECT id, email, full_name, role, email_verified
FROM profiles
WHERE role = 'admin'
ORDER BY email;
