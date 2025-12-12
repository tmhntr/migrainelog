import { supabase } from '@/lib/supabase';
import type { Episode, EpisodeStats, PainLocation, Symptom, Trigger, Medication } from '@/types/episode';
import type { Database, Json } from '@/types/database';

/**
 * Episode Service
 *
 * Service layer for episode-related database operations
 */
class EpisodeService {
  async getEpisodes(): Promise<Episode[]> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) throw error;

    return data.map(this.transformEpisode);
  }

  async getEpisode(id: string): Promise<Episode> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return this.transformEpisode(data);
  }

  async createEpisode(
    episode: Omit<Episode, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Episode> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const insertData: Database['public']['Tables']['episodes']['Insert'] = {
      user_id: user.id,
      start_time: episode.start_time.toISOString(),
      end_time: episode.end_time?.toISOString() ?? null,
      severity: episode.severity,
      pain_location: episode.pain_location,
      symptoms: episode.symptoms,
      triggers: episode.triggers,
      medications: episode.medications.map(m => ({
        name: m.name,
        dosage: m.dosage,
        time_taken: m.time_taken.toISOString(),
        effectiveness: m.effectiveness,
      })) as unknown as Json,
      notes: episode.notes ?? null,
    };

    const { data, error } = await supabase
      .from('episodes')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single();

    if (error) throw error;

    return this.transformEpisode(data);
  }

  async updateEpisode(id: string, updates: Partial<Episode>): Promise<Episode> {
    const updateData: Database['public']['Tables']['episodes']['Update'] = {};

    if (updates.start_time) updateData.start_time = updates.start_time.toISOString();
    if (updates.end_time !== undefined) updateData.end_time = updates.end_time?.toISOString() ?? null;
    if (updates.severity !== undefined) updateData.severity = updates.severity;
    if (updates.pain_location) updateData.pain_location = updates.pain_location;
    if (updates.symptoms) updateData.symptoms = updates.symptoms;
    if (updates.triggers) updateData.triggers = updates.triggers;
    if (updates.medications) {
      updateData.medications = updates.medications.map(m => ({
        name: m.name,
        dosage: m.dosage,
        time_taken: m.time_taken.toISOString(),
        effectiveness: m.effectiveness,
      })) as unknown as Json;
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    updateData.updated_at = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateMethod = supabase.from('episodes').update as any;
    const { data, error } = await updateMethod(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.transformEpisode(data);
  }

  async deleteEpisode(id: string): Promise<void> {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getEpisodeStats(): Promise<EpisodeStats> {
    // TODO: Implement statistics calculation
    // This could use Supabase functions or client-side calculation
    throw new Error('Not implemented');
  }

  private transformEpisode(data: Database['public']['Tables']['episodes']['Row']): Episode {
    // Parse medications from JSONB
    let medications: Medication[] = [];
    if (data.medications && Array.isArray(data.medications)) {
      medications = (data.medications as Array<{
        name: string;
        dosage: string;
        time_taken: string;
        effectiveness?: number;
      }>).map(m => ({
        name: m.name,
        dosage: m.dosage,
        time_taken: new Date(m.time_taken),
        effectiveness: m.effectiveness,
      }));
    }

    return {
      id: data.id,
      user_id: data.user_id,
      start_time: new Date(data.start_time),
      end_time: data.end_time ? new Date(data.end_time) : null,
      severity: data.severity,
      pain_location: data.pain_location as PainLocation[],
      symptoms: data.symptoms as Symptom[],
      triggers: data.triggers as Trigger[],
      medications,
      notes: data.notes,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}

export const episodeService = new EpisodeService();
