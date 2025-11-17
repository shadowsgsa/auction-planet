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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      auction_deliveries: {
        Row: {
          auction_item_id: string
          buyer_id: string
          created_at: string
          delivered_at: string | null
          delivery_confirmed_at: string | null
          delivery_method: string
          id: string
          pickup_confirmed_at: string | null
          pickup_confirmed_by: string | null
          pickup_date: string | null
          pickup_location: string | null
          seller_id: string
          shipped_at: string | null
          shipping_address: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          auction_item_id: string
          buyer_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_confirmed_at?: string | null
          delivery_method: string
          id?: string
          pickup_confirmed_at?: string | null
          pickup_confirmed_by?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          seller_id: string
          shipped_at?: string | null
          shipping_address?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          auction_item_id?: string
          buyer_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_confirmed_at?: string | null
          delivery_method?: string
          id?: string
          pickup_confirmed_at?: string | null
          pickup_confirmed_by?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          seller_id?: string
          shipped_at?: string | null
          shipping_address?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_deliveries_auction_item_id_fkey"
            columns: ["auction_item_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_disputes: {
        Row: {
          auction_item_id: string
          created_at: string
          delivery_id: string
          description: string
          dispute_type: string
          evidence_urls: string[] | null
          filed_by: string
          id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          auction_item_id: string
          created_at?: string
          delivery_id: string
          description: string
          dispute_type: string
          evidence_urls?: string[] | null
          filed_by: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          auction_item_id?: string
          created_at?: string
          delivery_id?: string
          description?: string
          dispute_type?: string
          evidence_urls?: string[] | null
          filed_by?: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_disputes_auction_item_id_fkey"
            columns: ["auction_item_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_disputes_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "auction_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_items: {
        Row: {
          auction_completed_at: string | null
          category: string | null
          commission_rate: number | null
          condition: string | null
          consignment_status: string | null
          created_at: string
          current_price: number
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          images: Json | null
          inspection_end: string | null
          inspection_start: string | null
          listing_fee: number | null
          listing_fee_paid: boolean | null
          payment_status: string | null
          quantity: number | null
          removal_end: string | null
          removal_start: string | null
          reserve_price: number | null
          seller_id: string
          start_time: string
          starting_price: number
          status: string | null
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          auction_completed_at?: string | null
          category?: string | null
          commission_rate?: number | null
          condition?: string | null
          consignment_status?: string | null
          created_at?: string
          current_price?: number
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          images?: Json | null
          inspection_end?: string | null
          inspection_start?: string | null
          listing_fee?: number | null
          listing_fee_paid?: boolean | null
          payment_status?: string | null
          quantity?: number | null
          removal_end?: string | null
          removal_start?: string | null
          reserve_price?: number | null
          seller_id: string
          start_time?: string
          starting_price: number
          status?: string | null
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          auction_completed_at?: string | null
          category?: string | null
          commission_rate?: number | null
          condition?: string | null
          consignment_status?: string | null
          created_at?: string
          current_price?: number
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          images?: Json | null
          inspection_end?: string | null
          inspection_start?: string | null
          listing_fee?: number | null
          listing_fee_paid?: boolean | null
          payment_status?: string | null
          quantity?: number | null
          removal_end?: string | null
          removal_start?: string | null
          reserve_price?: number | null
          seller_id?: string
          start_time?: string
          starting_price?: number
          status?: string | null
          title?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      auction_payments: {
        Row: {
          auction_item_id: string
          buyer_id: string
          created_at: string
          escrow_status: string
          id: string
          platform_commission: number
          released_at: string | null
          seller_amount: number
          seller_id: string
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          auction_item_id: string
          buyer_id: string
          created_at?: string
          escrow_status?: string
          id?: string
          platform_commission?: number
          released_at?: string | null
          seller_amount: number
          seller_id: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          auction_item_id?: string
          buyer_id?: string
          created_at?: string
          escrow_status?: string
          id?: string
          platform_commission?: number
          released_at?: string | null
          seller_amount?: number
          seller_id?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_payments_auction_item_id_fkey"
            columns: ["auction_item_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_shop: {
        Row: {
          category: string | null
          commission_rate: number | null
          condition: string | null
          consignment_status: string | null
          created_at: string | null
          current_price: number | null
          description: string | null
          end_time: string | null
          expedited_shipping: boolean | null
          id: number
          inspection_end: string | null
          inspection_start: string | null
          listing_fee: number | null
          listing_fee_paid: boolean | null
          overnight_shipping: boolean | null
          payment_terms: string | null
          removal_end: string | null
          removal_start: string | null
          shipping_contact_name: string | null
          shipping_contact_phone: string | null
          shop_address_line1: string | null
          shop_address_line2: string | null
          shop_city: string | null
          shop_country: string | null
          shop_state: string | null
          shop_zip: string | null
          shopowner_id: string
          misc_tax_rate: string
          transport_excise_tax_rate:string
          total_tax:string
          city_tax_rate:string
          country_tax_rate:string
          state_tax_rate:string
          standard_shipping: boolean | null
          start_time: string | null
          starting_price: number | null
          status: string | null
          terms: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          commission_rate?: number | null
          condition?: string | null
          consignment_status?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          end_time?: string | null
          expedited_shipping?: boolean | null
          id?: number
          inspection_end?: string | null
          inspection_start?: string | null
          listing_fee?: number | null
          listing_fee_paid?: boolean | null
          overnight_shipping?: boolean | null
          payment_terms?: string | null
          removal_end?: string | null
          removal_start?: string | null
          shipping_contact_name?: string | null
          shipping_contact_phone?: string | null
          shop_address_line1?: string | null
          shop_address_line2?: string | null
          shop_city?: string | null
          shop_country?: string | null
          shop_state?: string | null
          shop_zip?: string | null
          shopowner_id: string
          standard_shipping?: boolean | null
          start_time?: string | null
          starting_price?: number | null
          status?: string | null
          terms?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          commission_rate?: number | null
          condition?: string | null
          consignment_status?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          end_time?: string | null
          expedited_shipping?: boolean | null
          id?: number
          inspection_end?: string | null
          inspection_start?: string | null
          listing_fee?: number | null
          listing_fee_paid?: boolean | null
          overnight_shipping?: boolean | null
          payment_terms?: string | null
          removal_end?: string | null
          removal_start?: string | null
          shipping_contact_name?: string | null
          shipping_contact_phone?: string | null
          shop_address_line1?: string | null
          shop_address_line2?: string | null
          shop_city?: string | null
          shop_country?: string | null
          shop_state?: string | null
          shop_zip?: string | null
          shopowner_id?: string
          standard_shipping?: boolean | null
          start_time?: string | null
          starting_price?: number | null
          status?: string | null
          terms?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          auction_item_id: string
          bidder_id: string
          created_at: string
          id: string
        }
        Insert: {
          amount: number
          auction_item_id: Number
          bidder_id: string
          created_at?: string
          id?: string
        }
        Update: {
          amount?: number
          auction_item_id?: string
          bidder_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_item_id_fkey"
            columns: ["auction_item_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          auction_id: number
          buy_now_price: number | null
          category: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          end_date: string
          highest_bid: number | null
          highest_bidder_id: number | null
          id: number
          image_urls: string[] | null
          location: string | null
          reserve_price: number | null
          shipping_cost: number | null
          shipping_option: string | null
          start_date: string
          starting_bid: number
          seller_id: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          auction_id: number
          buy_now_price?: number | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          highest_bid?: number | null
          highest_bidder_id?: number | null
          id?: number
          image_url?: string | null
          image_urls?: string[] | null
          location?: string | null
          reserve_price?: number | null
          shipping_cost?: number | null
          shipping_option?: string | null
          start_date: string
          starting_bid: number
          title: string
          updated_at?: string | null
        }
        Update: {
          auction_id?: number
          buy_now_price?: number | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          highest_bid?: number | null
          highest_bidder_id?: number | null
          id?: number
          image_url?: string | null
          image_urls?: string[] | null
          location?: string | null
          reserve_price?: number | null
          shipping_cost?: number | null
          shipping_option?: string | null
          start_date?: string
          starting_bid?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_auction"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auction_shop"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          auction_updates: boolean | null
          bid_notifications: boolean | null
          created_at: string
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          outbid_alerts: boolean | null
          payment_reminders: boolean | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          user_id: string
          winning_notifications: boolean | null
        }
        Insert: {
          auction_updates?: boolean | null
          bid_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          outbid_alerts?: boolean | null
          payment_reminders?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id: string
          winning_notifications?: boolean | null
        }
        Update: {
          auction_updates?: boolean | null
          bid_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          outbid_alerts?: boolean | null
          payment_reminders?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string
          winning_notifications?: boolean | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          billing_state: string | null
          billing_zip: string | null
          card_number: string
          cardholder_name: string
          created_at: string
          expiry_date: string
          id: string
          is_default: boolean | null
          payment_type: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          card_number: string
          cardholder_name: string
          created_at?: string
          expiry_date: string
          id?: string
          is_default?: boolean | null
          payment_type: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          card_number?: string
          cardholder_name?: string
          created_at?: string
          expiry_date?: string
          id?: string
          is_default?: boolean | null
          payment_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          user_type: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: { Args: { user_email: string }; Returns: boolean }
      get_admin_stats: {
        Args: never
        Returns: {
          approved_items: number
          bids_today: number
          new_users_week: number
          pending_consignments: number
          total_users: number
        }[]
      }
      is_admin: { Args: { user_id?: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
