// Modular database adapter — swap implementations without touching app code.
// Currently: Supabase. Could be Firebase, REST API, localStorage, etc.

import { supabase } from '@/integrations/supabase/client';
import type { Session, User as AuthUser } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  handle: string | null;
  avatar_url: string | null;
  rating: number;
  created_at: string;
}

// ─── Auth ────────────────────────────────────────────────────
export const auth = {
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (cb: (session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      cb(session);
    });
    return subscription;
  },
};

// ─── Profiles ────────────────────────────────────────────────
export const profiles = {
  get: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  update: async (userId: string, updates: Partial<Pick<Profile, 'name' | 'handle' | 'avatar_url'>>) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
  },

  getAll: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
