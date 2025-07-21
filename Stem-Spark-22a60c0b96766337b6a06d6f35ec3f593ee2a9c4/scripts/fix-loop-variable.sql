-- Fix loop variable error in any scripts
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Example of correct loop syntax
    FOR rec IN 
        SELECT id, email FROM auth.users LIMIT 5
    LOOP
        RAISE NOTICE 'User ID: %, Email: %', rec.id, rec.email;
    END LOOP;
    
    RAISE NOTICE 'Loop variable demonstration completed successfully';
END $$;
