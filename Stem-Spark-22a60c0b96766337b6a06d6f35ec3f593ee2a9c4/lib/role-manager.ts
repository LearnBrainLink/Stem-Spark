import { createServerClient } from "./supabase-simple"
import type { User } from "@supabase/supabase-js"

export type UserRole = "admin" | "teacher" | "student" | "parent"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  grade?: number | null
  school_name?: string | null
  country?: string | null
  state?: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

export class RoleManager {
  private supabase = createServerClient()

  /**
   * Get user role - ALWAYS from database first, never from metadata
   */
  async getUserRole(user: User): Promise<UserRole> {
    try {
      console.log(`🔍 Getting role for user ${user.id} from database...`)

      // ALWAYS get role from database first - this is the source of truth
      const databaseRole = await this.getRoleFromDatabase(user.id)
      if (databaseRole) {
        console.log(`✅ Role from database: ${databaseRole}`)
        return databaseRole
      }

      console.log(`⚠️ No role found in database for user ${user.id}, checking if profile exists...`)

      // If no role in database, check if profile exists at all
      const profileExists = await this.checkProfileExists(user.id)
      if (!profileExists) {
        console.log(`📝 Creating missing profile for user ${user.id}`)
        // Determine role from email pattern as fallback
        const emailRole = this.determineRoleFromEmail(user.email || "")
        await this.createMissingProfile(user, emailRole)
        return emailRole
      }

      // If profile exists but no role, update it
      console.log(`🔧 Profile exists but no role, updating...`)
      const emailRole = this.determineRoleFromEmail(user.email || "")
      await this.updateProfileRole(user.id, emailRole)
      return emailRole
    } catch (error) {
      console.error("❌ Error getting user role:", error)
      // Ultimate fallback
      return "student"
    }
  }

  /**
   * Get user profile with role information - ALWAYS from database
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log(`🔍 Fetching profile for user ${userId} from database...`)

      const { data, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("❌ Error fetching profile:", error)
        return null
      }

      if (!data) {
        console.log(`⚠️ No profile found for user ${userId}`)
        return null
      }

      console.log(`✅ Profile found: ${data.email} with role ${data.role}`)
      return data as UserProfile
    } catch (error) {
      console.error("❌ Unexpected error fetching profile:", error)
      return null
    }
  }

  /**
   * Create or update user profile with role
   */
  async upsertUserProfile(user: User, role: UserRole, additionalData?: Partial<UserProfile>): Promise<boolean> {
    try {
      console.log(`📝 Upserting profile for user ${user.id} with role ${role}`)

      const profileData = {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || additionalData?.full_name || "",
        role, // This is the key field - always set explicitly
        email_verified: !!user.email_confirmed_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...additionalData,
      }

      const { error } = await this.supabase.from("profiles").upsert(profileData, { onConflict: "id" })

      if (error) {
        console.error("❌ Error upserting profile:", error)
        return false
      }

      console.log(`✅ Profile upserted for user ${user.id} with role ${role}`)
      return true
    } catch (error) {
      console.error("❌ Unexpected error upserting profile:", error)
      return false
    }
  }

  /**
   * Update role for existing profile
   */
  async updateProfileRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      console.log(`🔧 Updating role for user ${userId} to ${role}`)

      const { error } = await this.supabase
        .from("profiles")
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("❌ Error updating role:", error)
        return false
      }

      console.log(`✅ Role updated for user ${userId} to ${role}`)
      return true
    } catch (error) {
      console.error("❌ Unexpected error updating role:", error)
      return false
    }
  }

  /**
   * Migrate all existing users to have proper roles in database
   */
  async migrateExistingUsersRoles(): Promise<{ success: number; failed: number; total: number }> {
    try {
      console.log(`🚀 Starting migration of existing users' roles...`)

      // Get all auth users
      const {
        data: { users },
        error: usersError,
      } = await this.supabase.auth.admin.listUsers()

      if (usersError) {
        console.error("❌ Error fetching users:", usersError)
        return { success: 0, failed: 0, total: 0 }
      }

      let success = 0
      let failed = 0
      const total = users?.length || 0

      console.log(`📊 Found ${total} users to migrate`)

      for (const user of users || []) {
        try {
          // Check if profile exists
          const { data: existingProfile } = await this.supabase
            .from("profiles")
            .select("id, role")
            .eq("id", user.id)
            .single()

          if (existingProfile && existingProfile.role) {
            console.log(`✅ User ${user.email} already has role ${existingProfile.role}`)
            success++
            continue
          }

          // Determine role from email or metadata
          let role: UserRole = "student" // default

          // Try metadata first
          if (user.user_metadata?.role && this.isValidRole(user.user_metadata.role)) {
            role = user.user_metadata.role as UserRole
          } else if (user.app_metadata?.role && this.isValidRole(user.app_metadata.role)) {
            role = user.app_metadata.role as UserRole
          } else {
            // Determine from email
            role = this.determineRoleFromEmail(user.email || "")
          }

          // Create or update profile
          const success_upsert = await this.upsertUserProfile(user, role)

          if (success_upsert) {
            console.log(`✅ Migrated user ${user.email} with role ${role}`)
            success++
          } else {
            console.error(`❌ Failed to migrate user ${user.email}`)
            failed++
          }
        } catch (userError) {
          console.error(`❌ Error migrating user ${user.email}:`, userError)
          failed++
        }
      }

      console.log(`🎉 Migration completed: ${success} success, ${failed} failed, ${total} total`)
      return { success, failed, total }
    } catch (error) {
      console.error("❌ Unexpected error during migration:", error)
      return { success: 0, failed: 0, total: 0 }
    }
  }

  /**
   * Check if user has required permissions
   */
  hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      student: 1,
      parent: 2,
      teacher: 3,
      admin: 4,
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  /**
   * Get dashboard URL based on role
   */
  getDashboardUrl(role: UserRole): string {
    switch (role) {
      case "admin":
        return "/admin"
      case "teacher":
        return "/teacher-dashboard"
      case "student":
        return "/student-dashboard"
      case "parent":
        return "/parent-dashboard"
      default:
        return "/student-dashboard"
    }
  }

  // Private helper methods

  private async getRoleFromDatabase(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("role").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("⚠️ No profile found in database")
        } else {
          console.error("❌ Database query error:", error)
        }
        return null
      }

      if (!data || !data.role) {
        console.log("⚠️ Profile exists but no role set")
        return null
      }

      return this.isValidRole(data.role) ? (data.role as UserRole) : null
    } catch (error) {
      console.error("❌ Database query error:", error)
      return null
    }
  }

  private async checkProfileExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("id").eq("id", userId).single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }

  private determineRoleFromEmail(email: string): UserRole {
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

  private async createMissingProfile(user: User, role: UserRole): Promise<void> {
    try {
      await this.upsertUserProfile(user, role)
      console.log(`✅ Created missing profile for user ${user.id} with role ${role}`)
    } catch (error) {
      console.error("❌ Failed to create missing profile:", error)
    }
  }

  private isValidRole(role: any): boolean {
    return ["admin", "teacher", "student", "parent"].includes(role)
  }
}

// Singleton instance
export const roleManager = new RoleManager()
