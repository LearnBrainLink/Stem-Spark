-- Fix policy error for "Users can view own profile"
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Check if policy exists
    SELECT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Users can view own profile'
    ) INTO policy_exists;
    
    -- If policy exists, drop it first
    IF policy_exists THEN
        RAISE NOTICE 'Dropping existing policy "Users can view own profile"';
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    END IF;
    
    -- Create policy with correct syntax
    RAISE NOTICE 'Creating policy "Users can view own profile"';
    CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
    
    RAISE NOTICE 'Policy "Users can view own profile" created successfully';
END $$;
