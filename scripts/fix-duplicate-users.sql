-- Fix duplicate user email issue
DO $$
DECLARE
    duplicate_emails TEXT[];
    email TEXT;
BEGIN
    -- Find duplicate emails
    CREATE TEMP TABLE IF NOT EXISTS temp_duplicate_emails AS
    SELECT email
    FROM auth.users
    GROUP BY email
    HAVING COUNT(*) > 1;
    
    -- Get array of duplicate emails
    SELECT array_agg(email) INTO duplicate_emails FROM temp_duplicate_emails;
    
    -- If duplicates exist, handle them
    IF duplicate_emails IS NOT NULL THEN
        RAISE NOTICE 'Found % duplicate email(s)', array_length(duplicate_emails, 1);
        
        -- For each duplicate email
        FOREACH email IN ARRAY duplicate_emails LOOP
            RAISE NOTICE 'Handling duplicate email: %', email;
            
            -- Keep the newest record, delete others
            WITH ranked_users AS (
                SELECT 
                    id,
                    email,
                    created_at,
                    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
                FROM auth.users
                WHERE email = email
            )
            DELETE FROM auth.users
            WHERE id IN (
                SELECT id FROM ranked_users WHERE rn > 1
            );
            
            RAISE NOTICE 'Kept most recent user for email: %', email;
        END LOOP;
    ELSE
        RAISE NOTICE 'No duplicate emails found';
    END IF;
    
    -- Drop temp table
    DROP TABLE IF EXISTS temp_duplicate_emails;
    
    RAISE NOTICE 'Duplicate user check completed';
END $$;
