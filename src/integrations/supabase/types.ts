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
      comments: {
        Row: {
          content: string
          created_at: string
          deal_id: string
          document_id: string | null
          id: string
          milestone_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deal_id: string
          document_id?: string | null
          id?: string
          milestone_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string
          document_id?: string | null
          id?: string
          milestone_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          deal_id: string
          id: string
          invitation_token: string
          invited_by_user_id: string
          invitee_email: string
          invitee_role: Database["public"]["Enums"]["user_role"]
          status: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          deal_id: string
          id?: string
          invitation_token: string
          invited_by_user_id: string
          invitee_email: string
          invitee_role: Database["public"]["Enums"]["user_role"]
          status?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          deal_id?: string
          id?: string
          invitation_token?: string
          invited_by_user_id?: string
          invitee_email?: string
          invitee_role?: Database["public"]["Enums"]["user_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_invitations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_participants: {
        Row: {
          deal_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          deal_id: string
          id?: string
          joined_at?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          deal_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_participants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          asking_price: number | null
          business_abn: string | null
          business_acn: string | null
          business_industry: string | null
          business_legal_entity_type: string | null
          business_legal_name: string | null
          business_principal_place_address: string | null
          business_registered_address: string | null
          business_state: string | null
          business_trading_names: string | null
          business_years_in_operation: number | null
          buyer_id: string | null
          closing_date: string | null
          created_at: string
          deal_type: string | null
          description: string | null
          health_score: number
          id: string
          key_assets_excluded: string | null
          key_assets_included: string | null
          price: number | null
          primary_seller_contact_name: string | null
          reason_for_selling: string | null
          seller_id: string
          status: Database["public"]["Enums"]["deal_status"]
          target_completion_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          asking_price?: number | null
          business_abn?: string | null
          business_acn?: string | null
          business_industry?: string | null
          business_legal_entity_type?: string | null
          business_legal_name?: string | null
          business_principal_place_address?: string | null
          business_registered_address?: string | null
          business_state?: string | null
          business_trading_names?: string | null
          business_years_in_operation?: number | null
          buyer_id?: string | null
          closing_date?: string | null
          created_at?: string
          deal_type?: string | null
          description?: string | null
          health_score?: number
          id?: string
          key_assets_excluded?: string | null
          key_assets_included?: string | null
          price?: number | null
          primary_seller_contact_name?: string | null
          reason_for_selling?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["deal_status"]
          target_completion_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          asking_price?: number | null
          business_abn?: string | null
          business_acn?: string | null
          business_industry?: string | null
          business_legal_entity_type?: string | null
          business_legal_name?: string | null
          business_principal_place_address?: string | null
          business_registered_address?: string | null
          business_state?: string | null
          business_trading_names?: string | null
          business_years_in_operation?: number | null
          buyer_id?: string | null
          closing_date?: string | null
          created_at?: string
          deal_type?: string | null
          description?: string | null
          health_score?: number
          id?: string
          key_assets_excluded?: string | null
          key_assets_included?: string | null
          price?: number | null
          primary_seller_contact_name?: string | null
          reason_for_selling?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["deal_status"]
          target_completion_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analyses: {
        Row: {
          analysis_content: Json
          analysis_type: string
          created_at: string
          created_by: string | null
          document_id: string
          document_version_id: string
          id: string
        }
        Insert: {
          analysis_content: Json
          analysis_type: string
          created_at?: string
          created_by?: string | null
          document_id: string
          document_version_id: string
          id?: string
        }
        Update: {
          analysis_content?: Json
          analysis_type?: string
          created_at?: string
          created_by?: string | null
          document_id?: string
          document_version_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_analyses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_analyses_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          content: string
          created_at: string
          document_version_id: string
          id: string
          location_data: Json | null
          page_number: number | null
          parent_comment_id: string | null
          resolved: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_version_id: string
          id?: string
          location_data?: Json | null
          page_number?: number | null
          parent_comment_id?: string | null
          resolved?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_version_id?: string
          id?: string
          location_data?: Json | null
          page_number?: number | null
          parent_comment_id?: string | null
          resolved?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string
          description: string | null
          document_id: string
          id: string
          size: number
          storage_path: string
          type: string
          uploaded_at: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_id: string
          id?: string
          size: number
          storage_path: string
          type: string
          uploaded_at?: string
          uploaded_by: string
          version_number: number
        }
        Update: {
          created_at?: string
          description?: string | null
          document_id?: string
          id?: string
          size?: number
          storage_path?: string
          type?: string
          uploaded_at?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          deal_id: string
          description: string | null
          id: string
          latest_version_id: string | null
          milestone_id: string | null
          name: string
          size: number
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string
          type: string
          updated_at: string
          uploaded_by: string
          version: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          deal_id: string
          description?: string | null
          id?: string
          latest_version_id?: string | null
          milestone_id?: string | null
          name: string
          size: number
          status?: Database["public"]["Enums"]["document_status"]
          storage_path: string
          type: string
          updated_at?: string
          uploaded_by: string
          version?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          deal_id?: string
          description?: string | null
          id?: string
          latest_version_id?: string | null
          milestone_id?: string | null
          name?: string
          size?: number
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string
          type?: string
          updated_at?: string
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_latest_version_id_fkey"
            columns: ["latest_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          deal_id: string
          id: string
          sender_user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deal_id: string
          id?: string
          sender_user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string
          id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_assignments: {
        Row: {
          created_at: string
          id: string
          milestone_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          milestone_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_assignments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          deal_id: string
          description: string | null
          due_date: string | null
          id: string
          order_index: number
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deal_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_index: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deal_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
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
          company: string | null
          created_at: string
          email: string
          id: string
          is_professional: boolean | null
          name: string
          onboarding_complete: boolean
          phone: string | null
          professional_bio: string | null
          professional_contact_email: string | null
          professional_firm_name: string | null
          professional_headline: string | null
          professional_location: string | null
          professional_phone: string | null
          professional_specializations: Json | null
          professional_website: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email: string
          id: string
          is_professional?: boolean | null
          name: string
          onboarding_complete?: boolean
          phone?: string | null
          professional_bio?: string | null
          professional_contact_email?: string | null
          professional_firm_name?: string | null
          professional_headline?: string | null
          professional_location?: string | null
          professional_phone?: string | null
          professional_specializations?: Json | null
          professional_website?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_professional?: boolean | null
          name?: string
          onboarding_complete?: boolean
          phone?: string | null
          professional_bio?: string | null
          professional_contact_email?: string | null
          professional_firm_name?: string | null
          professional_headline?: string | null
          professional_location?: string | null
          professional_phone?: string | null
          professional_specializations?: Json | null
          professional_website?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      secure_share_links: {
        Row: {
          can_download: boolean
          can_view: boolean
          created_at: string
          document_version_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          shared_by_user_id: string
          token: string
        }
        Insert: {
          can_download?: boolean
          can_view?: boolean
          created_at?: string
          document_version_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          shared_by_user_id: string
          token: string
        }
        Update: {
          can_download?: boolean
          can_view?: boolean
          created_at?: string
          document_version_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          shared_by_user_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_share_links_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      create_deal_invitation: {
        Args: {
          p_deal_id: string
          p_invitee_email: string
          p_invitee_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      get_allowed_deal_statuses: {
        Args: { p_deal_id: string }
        Returns: Json
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_deal_invitations: {
        Args: { p_deal_id: string }
        Returns: Json
      }
      get_deal_timeline: {
        Args: { deal_uuid: string }
        Returns: Database["public"]["CompositeTypes"]["timeline_event"][]
      }
      update_deal_status: {
        Args: { p_deal_id: string; p_new_status: string }
        Returns: Json
      }
    }
    Enums: {
      deal_status: "draft" | "active" | "pending" | "completed" | "cancelled"
      document_status: "draft" | "final" | "signed"
      milestone_status: "not_started" | "in_progress" | "completed" | "blocked"
      user_role:
        | "seller"
        | "buyer"
        | "lawyer"
        | "admin"
        | "advisor"
        | "browsing"
    }
    CompositeTypes: {
      timeline_event: {
        id: string | null
        type: string | null
        timestamp: string | null
        title: string | null
        description: string | null
        user_id: string | null
        user_name: string | null
        user_avatar: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      deal_status: ["draft", "active", "pending", "completed", "cancelled"],
      document_status: ["draft", "final", "signed"],
      milestone_status: ["not_started", "in_progress", "completed", "blocked"],
      user_role: ["seller", "buyer", "lawyer", "admin", "advisor", "browsing"],
    },
  },
} as const
