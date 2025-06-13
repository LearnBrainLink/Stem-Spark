-- Check if start_date column exists in internships table
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'internships'
        AND column_name = 'start_date'
    ) INTO column_exists;

    -- If column doesn't exist, add it
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding start_date column to internships table';
        EXECUTE 'ALTER TABLE internships ADD COLUMN start_date DATE';
    ELSE
        RAISE NOTICE 'start_date column already exists in internships table';
    END IF;
    
    -- Check if end_date column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'internships'
        AND column_name = 'end_date'
    ) INTO column_exists;

    -- If column doesn't exist, add it
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding end_date column to internships table';
        EXECUTE 'ALTER TABLE internships ADD COLUMN end_date DATE';
    ELSE
        RAISE NOTICE 'end_date column already exists in internships table';
    END IF;
    
    RAISE NOTICE 'Internships table structure check completed';
END $$;
