import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 資料庫類型定義
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          email?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          email?: string | null
          joined_at?: string
        }
      }
      time_slots: {
        Row: {
          id: string
          event_id: string
          participant_id: string
          day: string
          time_start: string
          time_end: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_id: string
          day: string
          time_start: string
          time_end: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_id?: string
          day?: string
          time_start?: string
          time_end?: string
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          event_id: string
          participant_id: string
          time_slot_id: string
          vote_type: 'yes' | 'no' | 'maybe'
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_id: string
          time_slot_id: string
          vote_type: 'yes' | 'no' | 'maybe'
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_id?: string
          time_slot_id?: string
          vote_type?: 'yes' | 'no' | 'maybe'
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 