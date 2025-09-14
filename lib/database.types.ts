export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      buyers: {
        Row: {
          id: string
          owner_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          budget_min: number | null
          budget_max: number | null
          preferred_locations: string[]
          property_type: string | null
          bedrooms: number | null
          bathrooms: number | null
          square_footage: number | null
          move_in_timeline: string | null
          financing_status: string | null
          agent_notes: string | null
          tags: string[]
          lead_source: string | null
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_locations?: string[]
          property_type?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_footage?: number | null
          move_in_timeline?: string | null
          financing_status?: string | null
          agent_notes?: string | null
          tags?: string[]
          lead_source?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_locations?: string[]
          property_type?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_footage?: number | null
          move_in_timeline?: string | null
          financing_status?: string | null
          agent_notes?: string | null
          tags?: string[]
          lead_source?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_history: {
        Row: {
          id: string
          buyer_id: string
          owner_id: string
          action: string
          field_name: string | null
          old_value: string | null
          new_value: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          owner_id: string
          action: string
          field_name?: string | null
          old_value?: string | null
          new_value?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          owner_id?: string
          action?: string
          field_name?: string | null
          old_value?: string | null
          new_value?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_history_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_history_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          company: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
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
