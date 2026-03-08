export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          court_id: string
          created_at: string
          expires_at: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          court_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          court_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      courts: {
        Row: {
          added_by: string | null
          address: string
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          zip_code: string | null
        }
        Insert: {
          added_by?: string | null
          address: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          zip_code?: string | null
        }
        Update: {
          added_by?: string | null
          address?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      matches_1v1: {
        Row: {
          court_id: string
          created_at: string
          id: string
          loser_id: string
          loser_score: number
          status: string
          winner_id: string
          winner_score: number
        }
        Insert: {
          court_id?: string
          created_at?: string
          id?: string
          loser_id: string
          loser_score?: number
          status?: string
          winner_id: string
          winner_score?: number
        }
        Update: {
          court_id?: string
          created_at?: string
          id?: string
          loser_id?: string
          loser_score?: number
          status?: string
          winner_id?: string
          winner_score?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          message: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          message: string
          read?: boolean
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          message?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          court_id: string
          created_at: string
          end_at: string
          id: string
          note: string | null
          start_at: string
          user_id: string
        }
        Insert: {
          court_id?: string
          created_at?: string
          end_at: string
          id?: string
          note?: string | null
          start_at: string
          user_id: string
        }
        Update: {
          court_id?: string
          created_at?: string
          end_at?: string
          id?: string
          note?: string | null
          start_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          handle: string | null
          id: string
          local_court_id: string | null
          name: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          handle?: string | null
          id?: string
          local_court_id?: string | null
          name: string
          rating?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          handle?: string | null
          id?: string
          local_court_id?: string | null
          name?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_local_court_id_fkey"
            columns: ["local_court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      run_events: {
        Row: {
          court_id: string
          created_at: string
          created_by: string
          format: string
          id: string
          max_players: number
          note: string | null
          start_at: string
        }
        Insert: {
          court_id?: string
          created_at?: string
          created_by: string
          format?: string
          id?: string
          max_players?: number
          note?: string | null
          start_at: string
        }
        Update: {
          court_id?: string
          created_at?: string
          created_by?: string
          format?: string
          id?: string
          max_players?: number
          note?: string | null
          start_at?: string
        }
        Relationships: []
      }
      run_rsvps: {
        Row: {
          created_at: string
          id: string
          run_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          run_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_rsvps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run_events"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
