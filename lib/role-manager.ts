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
   * Get user role with multiple fallback mechanisms
   */
  async getUserRole(user: User): Promise<UserRole> {
    try {
      // Method 1: Try to get role from user metadata (fastest)
      const metadataRole = user.user_metadata?.role
      if (metadataRole && this.isValidRole(metadataRole)) {
        console.log(`✅ Role from metadata: ${metadataRole}`)
        return metadataRole as UserRole
      }

      // Method 2: Try to get role from database profile
      const databaseRole = await this.getRoleFromDatabase(user.id)
      if (databaseRole) {
        console.log(`✅ Role from database: ${databaseRole}`)
        // Update metadata for faster future lookups
        await this.updateUserMetadata(user.id, { role: databaseRole })
        return databaseRole
      }

      // Method 3: Try to get role from app metadata
      const appMetadataRole = user.app_metadata?.role
      if (appMetadataRole && this.isValidRole(appMetadataRole)) {
        console.log(`✅ Role from app metadata: ${appMetadataRole}`)
        return appMetadataRole as UserRole
      }

      // Method 4: Fallback - determine role from email pattern
      const emailRole = this.determineRoleFromEmail(user.email || "")
      console.log(`⚠️ Using email-based role fallback: ${emailRole}`)

      // Create profile with fallback role
      await this.createMissingProfile(user, emailRole)

      return emailRole
    } catch (error) {
      console.error("❌ Error getting user role:", error)
      // Ultimate fallback
      return "student"
    }
  }

  /**
   * Get user profile with role information
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("❌ Error fetching profile:", error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error("❌ Unexpected error fetching profile:", error)
      return null
    }
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(user: User, role: UserRole, additionalData?: Partial<UserProfile>): Promise<boolean> {
    try {
      const profileData = {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || additionalData?.full_name || "",
        role,
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

      if (error || !data) {
        console.log("⚠️ No profile found in database")
        return null
      }

      return this.isValidRole(data.role) ? (data.role as UserRole) : null
    } catch (error) {
      console.error("❌ Database query error:", error)
      return null
    }
  }

  private async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<void> {
    try {
      await this.supabase.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
      })
    } catch (error) {
      console.error("⚠️ Failed to update user metadata:", error)
    }
  }

  private determineRoleFromEmail(email: string): UserRole {
    if (email.includes("admin") || email.includes("administrator")) {
      return "admin"
    }
    if (email.includes("teacher") || email.includes("instructor") || email.includes("educator")) {
      return "teacher"
    }
    if (email.includes("parent") || email.includes("guardian")) {
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
