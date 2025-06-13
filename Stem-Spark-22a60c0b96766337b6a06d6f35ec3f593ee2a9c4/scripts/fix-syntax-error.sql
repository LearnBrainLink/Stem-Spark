-- Fix syntax error near "column_name"
DO $$
DECLARE
    table_name text := 'profiles';
    column_name text := 'email';
    column_exists boolean;
BEGIN
    -- Correct way to check if a column exists
    EXECUTE format('
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = %L
            AND column_name = %L
        )', table_name, column_name)
    INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'Column % exists in table %', column_name, table_name;
    ELSE
        RAISE NOTICE 'Column % does not exist in table %', column_name, table_name;
    END IF;
    
    RAISE NOTICE 'Syntax error fix demonstration completed';
END $$;
