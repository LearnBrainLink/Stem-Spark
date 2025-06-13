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