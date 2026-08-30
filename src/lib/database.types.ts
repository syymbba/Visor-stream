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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      creator_stats: {
        Row: {
          completed_orders_count: number
          id: number
          revenue_this_month_usd: number | null
          stats_backfilled_at: string | null
          stream_key: string | null
          stream_title: string | null
          subscribers_count: number | null
          total_creator_earnings_usd_cents: number
          total_gross_usd_cents: number
          total_platform_fees_usd_cents: number
          total_reserved_payout_usd_cents: number
          total_subscriptions_count: number
          total_tips_count: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_orders_count?: number
          id?: number
          revenue_this_month_usd?: number | null
          stats_backfilled_at?: string | null
          stream_key?: string | null
          stream_title?: string | null
          subscribers_count?: number | null
          total_creator_earnings_usd_cents?: number
          total_gross_usd_cents?: number
          total_platform_fees_usd_cents?: number
          total_reserved_payout_usd_cents?: number
          total_subscriptions_count?: number
          total_tips_count?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_orders_count?: number
          id?: number
          revenue_this_month_usd?: number | null
          stats_backfilled_at?: string | null
          stream_key?: string | null
          stream_title?: string | null
          subscribers_count?: number | null
          total_creator_earnings_usd_cents?: number
          total_gross_usd_cents?: number
          total_platform_fees_usd_cents?: number
          total_reserved_payout_usd_cents?: number
          total_subscriptions_count?: number
          total_tips_count?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      live_predictions: {
        Row: {
          created_at: string | null
          id: number
          option_a: string
          option_b: string
          pool_a: number | null
          pool_b: number | null
          question: string
          status: string
          stream_id: string
          total_participants: number | null
          winning_option: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          option_a: string
          option_b: string
          pool_a?: number | null
          pool_b?: number | null
          question: string
          status?: string
          stream_id: string
          total_participants?: number | null
          winning_option?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          option_a?: string
          option_b?: string
          pool_a?: number | null
          pool_b?: number | null
          question?: string
          status?: string
          stream_id?: string
          total_participants?: number | null
          winning_option?: string | null
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount_usd: string
          created_at: string | null
          creator_id: string
          currency: string
          fee_usd: string
          id: number
          kyc_tier: string | null
          local_amount: string
          net_payout_usd: string
          notes: string | null
          phone: string
          provider: string
          receipt_number: string | null
          recipient_name: string
          reference: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_usd: string
          created_at?: string | null
          creator_id: string
          currency: string
          fee_usd?: string
          id?: number
          kyc_tier?: string | null
          local_amount: string
          net_payout_usd: string
          notes?: string | null
          phone: string
          provider: string
          receipt_number?: string | null
          recipient_name: string
          reference: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_usd?: string
          created_at?: string | null
          creator_id?: string
          currency?: string
          fee_usd?: string
          id?: number
          kyc_tier?: string | null
          local_amount?: string
          net_payout_usd?: string
          notes?: string | null
          phone?: string
          provider?: string
          receipt_number?: string | null
          recipient_name?: string
          reference?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pesapal_orders: {
        Row: {
          amount: string
          created_at: string | null
          creator_earnings: string | null
          creator_id: string | null
          currency: string
          description: string | null
          email: string | null
          id: number
          merchant_reference: string
          order_tracking_id: string | null
          payment_method: string | null
          pesapal_confirmation_code: string | null
          phone: string | null
          plan_id: string | null
          platform_earnings: string | null
          status: string
          stream_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: string
          created_at?: string | null
          creator_earnings?: string | null
          creator_id?: string | null
          currency: string
          description?: string | null
          email?: string | null
          id?: number
          merchant_reference: string
          order_tracking_id?: string | null
          payment_method?: string | null
          pesapal_confirmation_code?: string | null
          phone?: string | null
          plan_id?: string | null
          platform_earnings?: string | null
          status?: string
          stream_id?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: string
          created_at?: string | null
          creator_earnings?: string | null
          creator_id?: string | null
          currency?: string
          description?: string | null
          email?: string | null
          id?: number
          merchant_reference?: string
          order_tracking_id?: string | null
          payment_method?: string | null
          pesapal_confirmation_code?: string | null
          phone?: string | null
          plan_id?: string | null
          platform_earnings?: string | null
          status?: string
          stream_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          country: string | null
          country_code: string | null
          created_at: string
          display_name: string | null
          id: string
          is_verified: boolean
          mobile_money_supported: boolean
          subscribers_count: number
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_verified?: boolean
          mobile_money_supported?: boolean
          subscribers_count?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_verified?: boolean
          mobile_money_supported?: boolean
          subscribers_count?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      scrim_lobbies: {
        Row: {
          created_at: string | null
          current_teams: number
          entry_fee: string | null
          format: string
          game: string
          host_name: string
          host_user_id: string
          id: number
          lobby_code: string
          max_teams: number
          prize_pool_usd: string | null
          server_region: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          current_teams?: number
          entry_fee?: string | null
          format: string
          game: string
          host_name: string
          host_user_id: string
          id?: number
          lobby_code: string
          max_teams?: number
          prize_pool_usd?: string | null
          server_region?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string | null
          current_teams?: number
          entry_fee?: string | null
          format?: string
          game?: string
          host_name?: string
          host_user_id?: string
          id?: number
          lobby_code?: string
          max_teams?: number
          prize_pool_usd?: string | null
          server_region?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      streams: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          game: string | null
          id: string
          started_at: string | null
          status: string
          stream_key: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          viewer_count: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          game?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          viewer_count?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          game?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viewer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "streams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          amount: string
          created_at: string | null
          currency: string
          id: number
          message: string | null
          provider: string | null
          sender: string
          sender_uid: string | null
          stream_id: string
        }
        Insert: {
          amount: string
          created_at?: string | null
          currency: string
          id?: number
          message?: string | null
          provider?: string | null
          sender: string
          sender_uid?: string | null
          stream_id: string
        }
        Update: {
          amount?: string
          created_at?: string | null
          currency?: string
          id?: number
          message?: string | null
          provider?: string | null
          sender?: string
          sender_uid?: string | null
          stream_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          bio: string | null
          created_at: string | null
          currency: string | null
          data_saver: string | null
          display_name: string | null
          email: string
          gamer_tag: string | null
          id: number
          momo_phone: string | null
          momo_provider: string | null
          photo_url: string | null
          two_factor_enabled: boolean
          two_factor_enabled_at: string | null
          two_factor_pending_secret: string | null
          two_factor_secret: string | null
          uid: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          data_saver?: string | null
          display_name?: string | null
          email: string
          gamer_tag?: string | null
          id?: number
          momo_phone?: string | null
          momo_provider?: string | null
          photo_url?: string | null
          two_factor_enabled?: boolean
          two_factor_enabled_at?: string | null
          two_factor_pending_secret?: string | null
          two_factor_secret?: string | null
          uid: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          data_saver?: string | null
          display_name?: string | null
          email?: string
          gamer_tag?: string | null
          id?: number
          momo_phone?: string | null
          momo_provider?: string | null
          photo_url?: string | null
          two_factor_enabled?: boolean
          two_factor_enabled_at?: string | null
          two_factor_pending_secret?: string | null
          two_factor_secret?: string | null
          uid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_published: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          views_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          views_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      streams_public: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          game: string | null
          id: string | null
          started_at: string | null
          status: string | null
          thumbnail_url: string | null
          title: string | null
          user_id: string | null
          viewer_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          game?: string | null
          id?: string | null
          started_at?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string | null
          viewer_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          game?: string | null
          id?: string | null
          started_at?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: string | null
          created_at: string | null
          creator_id: string | null
          currency: string | null
          id: string | null
          source: string | null
          status: string | null
          type: string | null
          user_id: string | null
        }
        Relationships: []
      }
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
