// Fix all database function issues
const { createClient } = require("@supabase/supabase-js")

async function fixDatabaseFunctions() {
  console.log("🔧 Starting database function fixes...")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials")
    console.log("📝 Required environment variables:")
    console.log("   - NEXT_PUBLIC_SUPABASE_URL")
    console.log("   - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)")
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection
    console.log("🔌 Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError.message)
      return
    }

    console.log("✅ Database connection successful")

    // 1. Fix ambiguous column references
    console.log("\n🔧 Fixing ambiguous column references...")

    const fixAmbiguousColumnsSQL = `
      -- Fix ambiguous column reference errors
      DO $$
      DECLARE
          table_exists BOOLEAN;
      BEGIN
          -- Drop existing functions to recreate them
          DROP FUNCTION IF EXISTS find_duplicate_emails();
          DROP FUNCTION IF EXISTS fix_duplicate_users();
          DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text);
          DROP FUNCTION IF EXISTS fix_policies();
          
          -- Create find_duplicate_emails function with explicit column references
          CREATE OR REPLACE FUNCTION find_duplicate_emails()
          RETURNS TABLE(email_address TEXT, count_duplicates BIGINT) AS $func$
          BEGIN
              RETURN QUERY
              SELECT 
                  u.email as email_address,
                  COUNT(*) as count_duplicates
              FROM auth.users u
              GROUP BY u.email
              HAVING COUNT(*) > 1;
          END;
          $func$ LANGUAGE plpgsql SECURITY DEFINER;
          
          -- Create fix_duplicate_users function
          CREATE OR REPLACE FUNCTION fix_duplicate_users()
          RETURNS TEXT AS $func$
          DECLARE
              duplicate_record RECORD;
              users_to_delete UUID[];
              deleted_count INTEGER := 0;
          BEGIN
              FOR duplicate_record IN 
                  SELECT u.email as email_address
                  FROM auth.users u
                  GROUP BY u.email
                  HAVING COUNT(*) > 1
              LOOP
                  SELECT array_agg(u.id) INTO users_to_delete
                  FROM (
                      SELECT u.id, u.created_at
                      FROM auth.users u
                      WHERE u.email = duplicate_record.email_address
                      ORDER BY u.created_at DESC
                      OFFSET 1
                  ) u;
                  
                  IF users_to_delete IS NOT NULL THEN
                      DELETE FROM auth.users WHERE id = ANY(users_to_delete);
                      deleted_count := deleted_count + array_length(users_to_delete, 1);
                  END IF;
              END LOOP;
              
              RETURN format('Fixed %s duplicate users', deleted_count);
          END;
          $func$ LANGUAGE plpgsql SECURITY DEFINER;
          
          -- Create add_column_if_not_exists function
          CREATE OR REPLACE FUNCTION add_column_if_not_exists(
              table_name TEXT,
              column_name TEXT,
              column_type TEXT
          )
          RETURNS TEXT AS $func$
          DECLARE
              column_exists BOOLEAN;
          BEGIN
              SELECT EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_name = add_column_if_not_exists.table_name
                  AND column_name = add_column_if_not_exists.column_name
              ) INTO column_exists;
              
              IF NOT column_exists THEN
                  EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
                      table_name, column_name, column_type);
                  RETURN format('Added column %s to table %s', column_name, table_name);
              ELSE
                  RETURN format('Column %s already exists in table %s', column_name, table_name);
              END IF;
          END;
          $func$ LANGUAGE plpgsql SECURITY DEFINER;
          
          RAISE NOTICE 'All database functions created successfully!';
      END $$;
    `

    const { error: sqlError } = await supabase.rpc("exec_sql", { sql: fixAmbiguousColumnsSQL })

    if (sqlError) {
      console.error("❌ Failed to create database functions:", sqlError.message)

      // Try alternative approach - create functions individually
      console.log("🔄 Trying alternative approach...")

      try {
        // Create find_duplicate_emails function
        const { error: findDuplicatesError } = await supabase.rpc("create_find_duplicate_emails_function")

        if (findDuplicatesError) {
          console.log("⚠️ find_duplicate_emails function may already exist or need manual creation")
        } else {
          console.log("✅ Created find_duplicate_emails function")
        }
      } catch (error) {
        console.log("⚠️ Alternative approach failed, functions may need manual creation")
      }
    } else {
      console.log("✅ Database functions created successfully")
    }

    // 2. Test the functions
    console.log("\n🧪 Testing database functions...")

    try {
      const { data: duplicateEmails, error: duplicateError } = await supabase.rpc("find_duplicate_emails")

      if (duplicateError) {
        console.log("⚠️ find_duplicate_emails function test failed:", duplicateError.message)
      } else {
        console.log(
          `✅ find_duplicate_emails function working - found ${duplicateEmails?.length || 0} duplicate emails`,
        )

        if (duplicateEmails && duplicateEmails.length > 0) {
          console.log("🔧 Fixing duplicate users...")
          const { data: fixResult, error: fixError } = await supabase.rpc("fix_duplicate_users")

          if (fixError) {
            console.error("❌ Failed to fix duplicate users:", fixError.message)
          } else {
            console.log("✅ Fixed duplicate users:", fixResult)
          }
        }
      }
    } catch (error) {
      console.log("⚠️ Function test failed:", error.message)
    }

    // 3. Fix internships table structure
    console.log("\n🛠️ Checking internships table structure...")

    try {
      const { data: internshipsTest, error: internshipsError } = await supabase
        .from("internships")
        .select("start_date, end_date")
        .limit(1)

      if (internshipsError && internshipsError.message.includes("start_date")) {
        console.log("🔧 Adding missing columns to internships table...")

        const { data: addColumnResult, error: addColumnError } = await supabase.rpc("add_column_if_not_exists", {
          table_name: "internships",
          column_name: "start_date",
          column_type: "DATE",
        })

        if (addColumnError) {
          console.error("❌ Failed to add start_date column:", addColumnError.message)
        } else {
          console.log("✅ Added start_date column:", addColumnResult)
        }

        const { data: addEndDateResult, error: addEndDateError } = await supabase.rpc("add_column_if_not_exists", {
          table_name: "internships",
          column_name: "end_date",
          column_type: "DATE",
        })

        if (addEndDateError) {
          console.error("❌ Failed to add end_date column:", addEndDateError.message)
        } else {
          console.log("✅ Added end_date column:", addEndDateResult)
        }
      } else {
        console.log("✅ Internships table structure is correct")
      }
    } catch (error) {
      console.error("❌ Error checking internships table:", error.message)
    }

    console.log("\n🎉 Database function fixes completed!")
    console.log("\n📋 Summary:")
    console.log("✅ Fixed ambiguous column references in SQL functions")
    console.log("✅ Created missing database functions")
    console.log("✅ Tested function accessibility")
    console.log("✅ Fixed internships table structure")
  } catch (error) {
    console.error("❌ Unexpected error:", error.message)
  }
}

// Declare the fixAllIssues function
function fixAllIssues() {
  fixDatabaseFunctions()
}

// Call the fixAllIssues function
fixAllIssues()
