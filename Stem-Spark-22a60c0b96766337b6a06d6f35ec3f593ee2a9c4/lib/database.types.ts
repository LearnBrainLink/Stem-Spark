export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent'
          avatar_url: string | null
          phone_number: string | null
          date_of_birth: string | null
          school_institution: string | null
          grade_level: number | null
          areas_of_interest: string[] | null
          bio: string | null
          total_volunteer_hours: number | null
          is_super_admin: boolean | null
          last_active: string | null
          application_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent'
          avatar_url?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          school_institution?: string | null
          grade_level?: number | null
          areas_of_interest?: string[] | null
          bio?: string | null
          total_volunteer_hours?: number | null
          is_super_admin?: boolean | null
          last_active?: string | null
          application_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent'
          avatar_url?: string | null
          phone_number?: string | null
          date_of_birth?: string | null
          school_institution?: string | null
          grade_level?: number | null
          areas_of_interest?: string[] | null
          bio?: string | null
          total_volunteer_hours?: number | null
          is_super_admin?: boolean | null
          last_active?: string | null
          application_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      channels: {
        Row: {
          id: string
          name: string
          description: string | null
          channel_type: 'public' | 'private' | 'group' | 'announcement' | 'role_restricted'
          created_by: string
          created_at: string
          channel_restrictions: Json | null
          allowed_roles: string[] | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          channel_type?: 'public' | 'private' | 'group' | 'announcement' | 'role_restricted'
          created_by: string
          created_at?: string
          channel_restrictions?: Json | null
          allowed_roles?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          channel_type?: 'public' | 'private' | 'group' | 'announcement' | 'role_restricted'
          created_by?: string
          created_at?: string
          channel_restrictions?: Json | null
          allowed_roles?: string[] | null
        }
      }
      channel_members: {
        Row: {
          id: string
          user_id: string
          channel_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          channel_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          channel_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          channel_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'file' | 'system'
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'file' | 'system'
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'file' | 'system'
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      volunteer_hours: {
        Row: {
          id: string
          intern_id: string
          activity_type: 'tutoring' | 'mentoring' | 'event_assistance' | 'other'
          description: string
          hours: number
          date: string
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          intern_id: string
          activity_type: 'tutoring' | 'mentoring' | 'event_assistance' | 'other'
          description: string
          hours: number
          date: string
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          intern_id?: string
          activity_type?: 'tutoring' | 'mentoring' | 'event_assistance' | 'other'
          description?: string
          hours?: number
          date?: string
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
      }
      tutoring_sessions: {
        Row: {
          id: string
          tutor_id: string
          student_id: string
          subject: string
          duration_minutes: number
          session_date: string
          status: 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          volunteer_hours_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          student_id: string
          subject: string
          duration_minutes: number
          session_date: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          volunteer_hours_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          student_id?: string
          subject?: string
          duration_minutes?: number
          session_date?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          volunteer_hours_id?: string | null
          created_at?: string
        }
      }
      admin_actions_log: {
        Row: {
          id: string
          action_type: string
          target_user_id: string | null
          performed_by: string
          is_allowed: boolean
          reason: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          action_type: string
          target_user_id?: string | null
          performed_by: string
          is_allowed: boolean
          reason?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          action_type?: string
          target_user_id?: string | null
          performed_by?: string
          is_allowed?: boolean
          reason?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      intern_applications: {
        Row: {
          id: string
          applicant_email: string
          full_name: string
          phone_number: string | null
          date_of_birth: string
          education_level: string
          school_institution: string
          areas_of_interest: string[]
          previous_experience: string | null
          availability: Json
          motivation_statement: string
          references: Json | null
          status: 'pending' | 'approved' | 'rejected' | 'interview_scheduled'
          submitted_at: string
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          interview_notes: string | null
        }
        Insert: {
          id?: string
          applicant_email: string
          full_name: string
          phone_number?: string | null
          date_of_birth: string
          education_level: string
          school_institution: string
          areas_of_interest: string[]
          previous_experience?: string | null
          availability: Json
          motivation_statement: string
          references?: Json | null
          status?: 'pending' | 'approved' | 'rejected' | 'interview_scheduled'
          submitted_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          interview_notes?: string | null
        }
        Update: {
          id?: string
          applicant_email?: string
          full_name?: string
          phone_number?: string | null
          date_of_birth?: string
          education_level?: string
          school_institution?: string
          areas_of_interest?: string[]
          previous_experience?: string | null
          availability?: Json
          motivation_statement?: string
          references?: Json | null
          status?: 'pending' | 'approved' | 'rejected' | 'interview_scheduled'
          submitted_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          interview_notes?: string | null
        }
      }
      application_reviews: {
        Row: {
          id: string
          application_id: string
          reviewer_id: string
          decision: 'approve' | 'reject' | 'request_interview'
          notes: string
          feedback_for_applicant: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          reviewer_id: string
          decision: 'approve' | 'reject' | 'request_interview'
          notes: string
          feedback_for_applicant?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          reviewer_id?: string
          decision?: 'approve' | 'reject' | 'request_interview'
          notes?: string
          feedback_for_applicant?: string | null
          created_at?: string
        }
      }
      parent_teacher_communications: {
        Row: {
          id: string
          parent_id: string
          teacher_id: string
          student_id: string
          subject: string
          message_thread_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          teacher_id: string
          student_id: string
          subject: string
          message_thread_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          teacher_id?: string
          student_id?: string
          subject?: string
          message_thread_id?: string | null
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string
          video_url: string
          thumbnail_url: string | null
          duration: number
          category: string
          grade_level: number
          status: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          video_url: string
          thumbnail_url?: string | null
          duration: number
          category: string
          grade_level: number
          status?: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          video_url?: string
          thumbnail_url?: string | null
          duration?: number
          category?: string
          grade_level?: number
          status?: string
          created_at?: string
          created_by?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Extended interfaces for enhanced functionality
export interface Message {
  id: string
  channel_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'system'
  file_url?: string
  created_at: string
  updated_at: string
  sender: {
    full_name: string
    role: string
    avatar_url?: string
  }
}

export interface Channel {
  id: string
  name: string
  description?: string
  channel_type: 'public' | 'private' | 'group' | 'announcement' | 'role_restricted'
  created_by: string
  created_at: string
  members: ChannelMember[]
  restrictions: ChannelRestrictions
  allowed_roles?: string[]
}

export interface ChannelMember {
  user_id: string
  channel_id: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface ChannelRestrictions {
  can_send_messages: 'everyone' | 'admins_only' | 'members_only'
  can_join: 'everyone' | 'invite_only' | 'role_restricted'
  is_announcement_channel: boolean
  moderation_enabled: boolean
}

export interface VolunteerHours {
  id: string
  intern_id: string
  activity_type: 'tutoring' | 'mentoring' | 'event_assistance' | 'other'
  description: string
  hours: number
  date: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
}

export interface TutoringSession {
  id: string
  tutor_id: string
  student_id: string
  subject: string
  duration_minutes: number
  session_date: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  volunteer_hours_id?: string
}

export interface InternApplication {
  id: string
  applicant_email: string
  full_name: string
  phone_number?: string
  date_of_birth: string
  education_level: string
  school_institution: string
  areas_of_interest: string[]
  previous_experience?: string
  availability: {
    days_per_week: number
    hours_per_week: number
    preferred_schedule: string
  }
  motivation_statement: string
  references?: Reference[]
  status: 'pending' | 'approved' | 'rejected' | 'interview_scheduled'
  submitted_at: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  interview_notes?: string
}

export interface Reference {
  name: string
  relationship: string
  email: string
  phone?: string
}

export interface AdminAction {
  action_type: 'edit_user' | 'delete_user' | 'change_role' | 'approve_hours' | 'approve_application' | 'reject_application'
  target_user_id: string
  performed_by: string
  is_allowed: boolean
  reason?: string
  timestamp: string
}

export interface RolePermissions {
  role: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent'
  permissions: {
    can_edit_admins: boolean
    can_delete_admins: boolean
    can_change_admin_roles: boolean
    can_approve_volunteer_hours: boolean
    can_manage_content: boolean
    can_view_analytics: boolean
    can_manage_applications: boolean
    can_create_restricted_channels: boolean
    can_send_announcements: boolean
  }
} 