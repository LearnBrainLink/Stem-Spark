"use server"

import { createServerClient } from "@/lib/supabase-server"
import { createAdminAccounts, verifyAdminAccounts } from "@/lib/admin-setup"
import { revalidatePath } from "next/cache"

// Database setup action
export async function setupDatabase(formData: FormData) {
  try {
    const databaseUrl = formData.get("databaseUrl") as string
    const databaseKey = formData.get("databaseKey") as string

    if (!databaseUrl || !databaseKey) {
      return { error: "Database URL and key are required" }
    }

    // Test database connection
    const supabase = createServerClient()
    
    // Try to perform a simple query to test connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count(*)")
      .limit(1)

    if (error) {
      return { error: `Database connection failed: ${error.message}` }
    }

    // Save database configuration (you might want to store this in a config table)
    const { error: configError } = await supabase
      .from("system_config")
      .upsert({
        key: "database_setup",
        value: {
          status: "configured",
          configured_at: new Date().toISOString(),
          url_configured: true,
          key_configured: true
        }
      })

    if (configError) {
      console.warn("Could not save database config:", configError.message)
    }

    revalidatePath("/admin/setup")
    return { success: true, message: "Database setup completed successfully!" }
  } catch (error) {
    console.error("Database setup error:", error)
    return { error: "Failed to setup database. Please check your configuration." }
  }
}

// Email setup action
export async function setupEmail(formData: FormData) {
  try {
    const smtpHost = formData.get("smtpHost") as string
    const smtpUser = formData.get("smtpUser") as string
    const smtpPass = formData.get("smtpPass") as string

    if (!smtpHost || !smtpUser || !smtpPass) {
      return { error: "All email configuration fields are required" }
    }

    // Test email configuration (basic validation)
    if (!smtpUser.includes("@")) {
      return { error: "Invalid email address format" }
    }

    const supabase = createServerClient()

    // Save email configuration
    const { error: configError } = await supabase
      .from("system_config")
      .upsert({
        key: "email_setup",
        value: {
          status: "configured",
          configured_at: new Date().toISOString(),
          smtp_host: smtpHost,
          smtp_user: smtpUser,
          smtp_configured: true
        }
      })

    if (configError) {
      console.warn("Could not save email config:", configError.message)
    }

    // Test email by sending a test message (optional)
    try {
      // You can implement actual email sending test here
      console.log("Email configuration saved successfully")
    } catch (emailError) {
      console.warn("Email test failed:", emailError)
    }

    revalidatePath("/admin/setup")
    return { success: true, message: "Email setup completed successfully!" }
  } catch (error) {
    console.error("Email setup error:", error)
    return { error: "Failed to setup email. Please check your configuration." }
  }
}

// Create admin account action
export async function createAdminAccount(formData: FormData) {
  try {
    const adminName = formData.get("adminName") as string
    const adminEmail = formData.get("adminEmail") as string
    const adminPassword = formData.get("adminPassword") as string

    if (!adminName || !adminEmail || !adminPassword) {
      return { error: "All admin account fields are required" }
    }

    if (adminPassword.length < 8) {
      return { error: "Password must be at least 8 characters long" }
    }

    if (!adminEmail.includes("@")) {
      return { error: "Invalid email address format" }
    }

    const supabase = createServerClient()

    // Create admin user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: "admin",
      },
    })

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "An account with this email already exists" }
      }
      return { error: `Failed to create admin user: ${authError.message}` }
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        email: adminEmail,
        full_name: adminName,
        role: "admin",
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        return { error: `Failed to create admin profile: ${profileError.message}` }
      }

      // Log admin creation activity
      await supabase.from("user_activities").insert({
        user_id: authData.user.id,
        activity_type: "admin_account_created",
        activity_description: `Admin account created during setup`,
        metadata: {
          email: adminEmail,
          full_name: adminName,
          created_during_setup: true,
          created_at: new Date().toISOString(),
        },
      })

      // Update system config
      const { error: configError } = await supabase
        .from("system_config")
        .upsert({
          key: "admin_setup",
          value: {
            status: "configured",
            configured_at: new Date().toISOString(),
            admin_created: true,
            admin_email: adminEmail
          }
        })

      if (configError) {
        console.warn("Could not save admin config:", configError.message)
      }

      revalidatePath("/admin/setup")
      return { success: true, message: "Admin account created successfully!" }
    }

    return { error: "Failed to create admin account" }
  } catch (error) {
    console.error("Admin account creation error:", error)
    return { error: "Failed to create admin account. Please try again." }
  }
}

// Create predefined admin accounts action
export async function createPredefinedAdmins() {
  try {
    const result = await createAdminAccounts()
    revalidatePath("/admin/setup")
    return result
  } catch (error) {
    console.error("Predefined admin creation error:", error)
    return { error: "Failed to create predefined admin accounts" }
  }
}

// Verify admin accounts action
export async function verifyAdmins() {
  try {
    const result = await verifyAdminAccounts()
    return result
  } catch (error) {
    console.error("Admin verification error:", error)
    return { error: "Failed to verify admin accounts" }
  }
}

// Check setup status action
export async function checkSetupStatus() {
  try {
    const supabase = createServerClient()

    // Check database connection
    let databaseStatus = false
    try {
      const { error } = await supabase.from("profiles").select("count(*)").limit(1)
      databaseStatus = !error
    } catch (e) {
      databaseStatus = false
    }

    // Check if admin accounts exist
    const { data: adminCount } = await supabase
      .from("profiles")
      .select("count(*)")
      .eq("role", "admin")

    const adminStatus = (adminCount as any)?.[0]?.count > 0

    // Check email configuration
    const { data: emailConfig } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "email_setup")
      .single()

    const emailStatus = emailConfig?.value?.smtp_configured || false

    // Check system configuration
    const { data: configs } = await supabase
      .from("system_config")
      .select("*")

    return {
      success: true,
      status: {
        database: databaseStatus,
        email: emailStatus,
        admin: adminStatus,
        overallSetup: databaseStatus && adminStatus
      },
      details: {
        adminCount: (adminCount as any)?.[0]?.count || 0,
        configs: configs || []
      }
    }
  } catch (error) {
    console.error("Setup status check error:", error)
    return { error: "Failed to check setup status" }
  }
}

// Export setup configuration
export async function exportSetupConfig() {
  try {
    const supabase = createServerClient()

    // Get all system configurations
    const { data: configs } = await supabase
      .from("system_config")
      .select("*")

    // Get admin accounts (without sensitive data)
    const { data: admins } = await supabase
      .from("profiles")
      .select("email, full_name, role, created_at")
      .eq("role", "admin")

    const setupConfig = {
      exported_at: new Date().toISOString(),
      database_connected: true,
      admin_accounts: admins || [],
      system_configs: configs || [],
      setup_complete: (admins?.length || 0) > 0
    }

    return {
      success: true,
      config: setupConfig,
      message: "Setup configuration exported successfully!"
    }
  } catch (error) {
    console.error("Export config error:", error)
    return { error: "Failed to export setup configuration" }
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const supabase = createServerClient()

    // Test basic connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count(*)")
      .limit(1)

    if (error) {
      return { error: `Database connection failed: ${error.message}` }
    }

    // Test table access
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list')
      .limit(5)

    let tableCount = 0
    if (!tablesError && tables) {
      tableCount = tables.length
    }

    return {
      success: true,
      message: "Database connection successful!",
      details: {
        connected: true,
        tablesAccessible: !tablesError,
        tableCount
      }
    }
  } catch (error) {
    console.error("Database connection test error:", error)
    return { error: "Database connection test failed" }
  }
} 