/**
 * Database Types
 *
 * This file contains TypeScript types for the Supabase database schema.
 * These types are based on the migration file: supabase/migrations/001_create_episodes.sql
 *
 * To regenerate these types from your Supabase project, use:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Medication {
  name: string;
  dosage: string;
  time_taken: string;
  effectiveness?: number;
}

export interface Database {
  public: {
    Tables: {
      episodes: {
        Row: {
          id: string;
          user_id: string;
          start_time: string;
          end_time: string | null;
          severity: number;
          pain_location: string[];
          symptoms: string[];
          triggers: string[];
          medications: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_time: string;
          end_time?: string | null;
          severity: number;
          pain_location?: string[];
          symptoms?: string[];
          triggers?: string[];
          medications?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string | null;
          severity?: number;
          pain_location?: string[];
          symptoms?: string[];
          triggers?: string[];
          medications?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "episodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
    };
    Views: {
      episode_stats: {
        Row: {
          user_id: string | null;
          total_episodes: number | null;
          average_severity: number | null;
          average_duration_hours: number | null;
          first_episode: string | null;
          latest_episode: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      validate_pain_location: {
        Args: {
          locations: string[];
        };
        Returns: boolean;
      };
      validate_symptoms: {
        Args: {
          symptom_list: string[];
        };
        Returns: boolean;
      };
      validate_triggers: {
        Args: {
          trigger_list: string[];
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for better type inference
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Specific type exports for convenience
export type Episode = Tables<'episodes'>;
export type EpisodeInsert = TablesInsert<'episodes'>;
export type EpisodeUpdate = TablesUpdate<'episodes'>;
export type EpisodeStats = Database['public']['Views']['episode_stats']['Row'];
