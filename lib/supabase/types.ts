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
          full_name: string | null
          phone: string | null
          role: 'user' | 'partner' | 'admin'
          id_verified: boolean
          id_document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'partner' | 'admin'
          id_verified?: boolean
          id_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'partner' | 'admin'
          id_verified?: boolean
          id_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      partners: {
        Row: {
          id: string
          user_id: string
          company_name: string
          business_license: string | null
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          business_license?: string | null
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          business_license?: string | null
          verified?: boolean
          created_at?: string
        }
      }
      spaces: {
        Row: {
          id: string
          partner_id: string
          name: string
          description: string | null
          address: string
          lock_id: string
          camera_url: string | null
          is_active: boolean
          open_hours: Json
          max_duration_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          name: string
          description?: string | null
          address: string
          lock_id: string
          camera_url?: string | null
          is_active?: boolean
          open_hours?: Json
          max_duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          name?: string
          description?: string | null
          address?: string
          lock_id?: string
          camera_url?: string | null
          is_active?: boolean
          open_hours?: Json
          max_duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      access_codes: {
        Row: {
          id: string
          user_id: string
          space_id: string
          code: string
          type: 'qr' | 'otp'
          expires_at: string
          used_at: string | null
          status: 'pending' | 'active' | 'used' | 'expired'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          space_id: string
          code: string
          type: 'qr' | 'otp'
          expires_at: string
          used_at?: string | null
          status?: 'pending' | 'active' | 'used' | 'expired'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          space_id?: string
          code?: string
          type?: 'qr' | 'otp'
          expires_at?: string
          used_at?: string | null
          status?: 'pending' | 'active' | 'used' | 'expired'
          created_at?: string
        }
      }
      access_logs: {
        Row: {
          id: string
          access_code_id: string | null
          user_id: string
          space_id: string
          event: 'requested' | 'granted' | 'denied' | 'unlocked' | 'locked' | 'expired'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          access_code_id?: string | null
          user_id: string
          space_id: string
          event: 'requested' | 'granted' | 'denied' | 'unlocked' | 'locked' | 'expired'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          access_code_id?: string | null
          user_id?: string
          space_id?: string
          event?: 'requested' | 'granted' | 'denied' | 'unlocked' | 'locked' | 'expired'
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}