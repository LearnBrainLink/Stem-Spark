export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          is_allowed: boolean
          metadata: Json | null
          performed_by: string | null
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          is_allowed: boolean
          metadata?: Json | null
          performed_by?: string | null
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          is_allowed?: boolean
          metadata?: Json | null
          performed_by?: string | null
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_channels: {
        Row: {
          channel_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          channel_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          channel_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_channel_members: {
        Row: {
          channel_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string | null
          file_url: string | null
          id: string
          message_type: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          grade: number | null
          id: string
          intern_specialties: string[] | null
          is_super_admin: boolean | null
          last_active: string | null
          last_login: string | null
          login_count: number | null
          phone: string | null
          role: string | null
          school: string | null
          school_name: string | null
          state: string | null
          total_volunteer_hours: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          grade?: number | null
          id?: string
          intern_specialties?: string[] | null
          is_super_admin?: boolean | null
          last_active?: string | null
          last_login?: string | null
          login_count?: number | null
          phone?: string | null
          role?: string | null
          school?: string | null
          school_name?: string | null
          state?: string | null
          total_volunteer_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          grade?: number | null
          id?: string
          intern_specialties?: string[] | null
          is_super_admin?: boolean | null
          last_active?: string | null
          last_login?: string | null
          login_count?: number | null
          phone?: string | null
          role?: string | null
          school?: string | null
          school_name?: string | null
          state?: string | null
          total_volunteer_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tutoring_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          intern_id: string | null
          learning_goals: string | null
          preferred_time: string | null
          scheduled_time: string | null
          session_notes: string | null
          status: string | null
          student_id: string | null
          subject: string
          updated_at: string | null
          volunteer_hours_id: string | null
          volunteer_hours_logged: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          intern_id?: string | null
          learning_goals?: string | null
          preferred_time?: string | null
          scheduled_time?: string | null
          session_notes?: string | null
          status?: string | null
          student_id?: string | null
          subject: string
          updated_at?: string | null
          volunteer_hours_id?: string | null
          volunteer_hours_logged?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          intern_id?: string | null
          learning_goals?: string | null
          preferred_time?: string | null
          scheduled_time?: string | null
          session_notes?: string | null
          status?: string | null
          student_id?: string | null
          subject?: string
          updated_at?: string | null
          volunteer_hours_id?: string | null
          volunteer_hours_logged?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tutoring_sessions_volunteer_hours_id_fkey"
            columns: ["volunteer_hours_id"]
            isOneToOne: false
            referencedRelation: "volunteer_hours"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_hours: {
        Row: {
          activity_date: string
          activity_description: string
          activity_type: string
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          hours: number
          id: string
          intern_id: string | null
          reference_id: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          activity_date: string
          activity_description: string
          activity_type: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          hours: number
          id?: string
          intern_id?: string | null
          reference_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_date?: string
          activity_description?: string
          activity_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          hours?: number
          id?: string
          intern_id?: string | null
          reference_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_hours_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      intern_applications: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          grade: number
          school: string
          bio: string
          specialties: string[] | null
          experience: string | null
          motivation: string
          availability: string
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string | null
          grade: number
          school: string
          bio: string
          specialties?: string[] | null
          experience?: string | null
          motivation: string
          availability: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          grade?: number
          school?: string
          bio?: string
          specialties?: string[] | null
          experience?: string | null
          motivation?: string
          availability?: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      // ... other existing tables
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "student" | "intern" | "parent" | "admin"
    }
  }
} 