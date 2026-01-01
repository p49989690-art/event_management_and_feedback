export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string
          event_type: string
          id: string
          image_url: string | null
          location: string | null
          max_attendees: number | null
          start_date: string
          status: string | null
          target_audience: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          start_date: string
          status?: string | null
          target_audience?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          start_date?: string
          status?: string | null
          target_audience?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          ai_analysis: Json | null
          category: string | null
          comment: string | null
          created_at: string | null
          event_id: string
          id: string
          is_anonymous: boolean | null
          rating: number
          sentiment: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          category?: string | null
          comment?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_anonymous?: boolean | null
          rating: number
          sentiment?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          category?: string | null
          comment?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_anonymous?: boolean | null
          rating?: number
          sentiment?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "feedback_analytics"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      feedback_analytics: {
        Row: {
          avg_rating: number | null
          event_id: string | null
          event_title: string | null
          last_feedback_at: string | null
          negative_count: number | null
          neutral_count: number | null
          positive_count: number | null
          total_feedback: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      refresh_feedback_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Simplified helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
