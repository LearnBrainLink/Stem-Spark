// Migration script to ensure all users have proper roles in database
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

function determineRoleFromEmail(email) {
  const emailLower = email.toLowerCase()

  if (emailLower.includes("admin") || emailLower.includes("administrator")) {
    return "admin"
  }
  if (emailLower.includes("teacher") || emailLower.includes("instructor") || emailLower.includes("educator")) {
    return "teacher"
  }
  if (emailLower.includes("parent") || emailLower.includes("guardian")) {
    return "parent"
  }
  return "student" // Default fallback
}

function isValidRole(role) {
  return ["admin", "teacher", "student", "parent"].includes(role)
}

async function migrateUserRoles() {
  try {
    console.log("🚀 Starting migration of all user roles...")

    // Get all auth users
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error("❌ Error fetching users:", usersError)
      return
    }

    console.log(`📊 Found ${users.length} users to check/migrate`)

    let migrated = 0
    let alreadyCorrect = 0
    let failed = 0

    for (const user of users) {
      try {
        console.log(`\n🔍 Checking user: ${user.email}`)

        // Check current profile
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, email, full_name")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error(`❌ Error fetching profile for ${user.email}:`, profileError)
          failed++
          continue
        }

        // Determine the correct role
        let correctRole = "student" // default

        // Priority 1: Existing database role (if valid)
        if (existingProfile?.role && isValidRole(existingProfile.role)) {
          correctRole = existingProfile.role
          console.log(`✅ User ${user.email} already has valid role: ${correctRole}`)
          alreadyCorrect++
          continue
        }

        // Priority 2: User metadata role
        if (user.user_metadata?.role && isValidRole(user.user_metadata.role)) {
          correctRole = user.user_metadata.role
          console.log(`📝 Using role from user metadata: ${correctRole}`)
        }
        // Priority 3: App metadata role
        else if (user.app_metadata?.role && isValidRole(user.app_metadata.role)) {
          correctRole = user.app_metadata.role
          console.log(`📝 Using role from app metadata: ${correctRole}`)
        }
        // Priority 4: Email-based determination
        else {
          correctRole = determineRoleFromEmail(user.email || "")
          console.log(`📝 Determined role from email: ${correctRole}`)
        }

        // Create or update profile
        const profileData = {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || existingProfile?.full_name || "",
          role: correctRole,
          email_verified: !!user.email_confirmed_at,
          created_at: existingProfile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: upsertError } = await supabase.from("profiles").upsert(profileData, { onConflict: "id" })

        if (upsertError) {
          console.error(`❌ Error upserting profile for ${user.email}:`, upsertError)
          failed++
          continue
        }

        console.log(`✅ Successfully migrated ${user.email} with role: ${correctRole}`)
        migrated++

        // Log the migration activity
        await supabase.from("user_activities").insert({
          user_id: user.id,
          activity_type: "role_migrated",
          activity_description: `Role migrated to database: ${correctRole}`,
          metadata: {
            migration_timestamp: new Date().toISOString(),
            role: correctRole,
            source: existingProfile ? "profile_update" : "profile_creation",
          },
        })
      } catch (userError) {
        console.error(`❌ Error processing user ${user.email}:`, userError)
        failed++
      }
    }

    console.log("\n🎉 Migration Summary:")
    console.log(`📊 Total users: ${users.length}`)
    console.log(`✅ Already correct: ${alreadyCorrect}`)
    console.log(`🔄 Migrated: ${migrated}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📈 Success rate: ${(((alreadyCorrect + migrated) / users.length) * 100).toFixed(1)}%`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
  }
}

// Run the migration
migrateUserRoles()
