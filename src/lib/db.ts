// Modular database adapter — swap implementations without touching app code.
// Currently: Supabase. Could be Firebase, REST API, localStorage, etc.

import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

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

export interface CheckIn {
  id: string;
  user_id: string;
  court_id: string;
  note: string;
  created_at: string;
  expires_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  court_id: string;
  start_at: string;
  end_at: string;
  note: string;
  created_at: string;
}

export interface Match1v1 {
  id: string;
  court_id: string;
  winner_id: string;
  loser_id: string;
  winner_score: number;
  loser_score: number;
  status: string;
  created_at: string;
}

export interface RunEvent {
  id: string;
  court_id: string;
  start_at: string;
  format: string;
  max_players: number;
  note: string;
  created_by: string;
  created_at: string;
}

export interface RunRSVP {
  id: string;
  run_id: string;
  user_id: string;
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

  ensure: async (userId: string, name?: string): Promise<Profile> => {
    const existing = await profiles.get(userId);
    if (existing) return existing;

    const fallbackName = name?.trim() || 'Player';
    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id: userId, name: fallbackName })
      .select('*')
      .single();

    if (error) {
      const retry = await profiles.get(userId);
      if (retry) return retry;
      throw error;
    }

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

// ─── Check-ins ───────────────────────────────────────────────
export const checkIns = {
  getActive: async (courtId = 'court1'): Promise<(CheckIn & { profile: Profile })[]> => {
    const { data: cis, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('court_id', courtId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const allProfiles = await profiles.getAll();
    const profileByUserId = new Map(allProfiles.map((profile) => [profile.user_id, profile]));

    return (cis ?? []).flatMap((ci) => {
      const profile = profileByUserId.get(ci.user_id);
      return profile ? [{ ...ci, profile }] : [];
    });
  },

  getActiveForUser: async (userId: string, courtId = 'court1'): Promise<CheckIn | null> => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('court_id', courtId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  create: async (userId: string, note = '', courtId = 'court1') => {
    const { error } = await supabase.from('check_ins').insert({
      user_id: userId,
      court_id: courtId,
      note,
    });
    if (error) throw error;
  },

  remove: async (userId: string, courtId = 'court1') => {
    const { error } = await supabase
      .from('check_ins')
      .delete()
      .eq('user_id', userId)
      .eq('court_id', courtId);
    if (error) throw error;
  },

  onChanges: (cb: () => void) => {
    const channel = supabase
      .channel('check_ins_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins' }, cb)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

// ─── Plans ───────────────────────────────────────────────────
export const plans = {
  getUpcoming: async (courtId = 'court1'): Promise<(Plan & { profile: Profile })[]> => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('court_id', courtId)
      .gte('end_at', new Date().toISOString())
      .order('start_at', { ascending: true });
    if (error) throw error;

    const allProfiles = await profiles.getAll();
    const profileByUserId = new Map(allProfiles.map((profile) => [profile.user_id, profile]));

    return (data ?? []).flatMap((plan) => {
      const profile = profileByUserId.get(plan.user_id);
      return profile ? [{ ...plan, profile }] : [];
    });
  },

  create: async (userId: string, startAt: string, endAt: string, note = '', courtId = 'court1') => {
    const { error } = await supabase.from('plans').insert({
      user_id: userId,
      court_id: courtId,
      start_at: startAt,
      end_at: endAt,
      note,
    });
    if (error) throw error;
  },

  update: async (planId: string, updates: Partial<Pick<Plan, 'start_at' | 'end_at' | 'note'>>) => {
    const { error } = await supabase.from('plans').update(updates).eq('id', planId);
    if (error) throw error;
  },

  remove: async (planId: string) => {
    const { error } = await supabase.from('plans').delete().eq('id', planId);
    if (error) throw error;
  },
};

// ─── Matches ─────────────────────────────────────────────────
export const matches = {
  getRecent: async (limit = 20): Promise<(Match1v1 & { winner: Profile; loser: Profile })[]> => {
    const { data, error } = await supabase
      .from('matches_1v1')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;

    const allProfiles = await profiles.getAll();
    const profileByUserId = new Map(allProfiles.map((profile) => [profile.user_id, profile]));

    return (data ?? []).flatMap((match) => {
      const winner = profileByUserId.get(match.winner_id);
      const loser = profileByUserId.get(match.loser_id);
      return winner && loser ? [{ ...match, winner, loser }] : [];
    });
  },

  create: async (winnerId: string, loserId: string, winnerScore: number, loserScore: number, courtId = 'court1') => {
    const { error } = await supabase.from('matches_1v1').insert({
      court_id: courtId,
      winner_id: winnerId,
      loser_id: loserId,
      winner_score: winnerScore,
      loser_score: loserScore,
    });
    if (error) throw error;
  },

  confirm: async (matchId: string) => {
    const { error } = await supabase
      .from('matches_1v1')
      .update({ status: 'confirmed' })
      .eq('id', matchId);
    if (error) throw error;
  },
};

// ─── Run Events ──────────────────────────────────────────────
export const runEvents = {
  getUpcoming: async (): Promise<(RunEvent & { rsvps: RunRSVP[]; creator: Profile })[]> => {
    const { data, error } = await supabase
      .from('run_events')
      .select('*')
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true });
    if (error) throw error;

    const allProfiles = await profiles.getAll();
    const profileByUserId = new Map(allProfiles.map((profile) => [profile.user_id, profile]));
    const { data: allRsvps } = await supabase.from('run_rsvps').select('*');

    const rsvpsByRunId = (allRsvps ?? []).reduce((acc, rsvp) => {
      const existing = acc.get(rsvp.run_id) ?? [];
      existing.push(rsvp);
      acc.set(rsvp.run_id, existing);
      return acc;
    }, new Map<string, RunRSVP[]>());

    return (data ?? []).flatMap((runEvent) => {
      const creator = profileByUserId.get(runEvent.created_by);
      if (!creator) return [];

      return [{
        ...runEvent,
        creator,
        rsvps: rsvpsByRunId.get(runEvent.id) ?? [],
      }];
    });
  },

  create: async (createdBy: string, startAt: string, format: string, maxPlayers: number, note = '', courtId = 'court1') => {
    const { data, error } = await supabase.from('run_events').insert({
      court_id: courtId,
      start_at: startAt,
      format,
      max_players: maxPlayers,
      note,
      created_by: createdBy,
    }).select().single();
    if (error) throw error;
    return data;
  },

  join: async (runId: string, userId: string) => {
    const { error } = await supabase.from('run_rsvps').insert({ run_id: runId, user_id: userId });
    if (error) throw error;
  },

  leave: async (runId: string, userId: string) => {
    const { error } = await supabase.from('run_rsvps').delete().eq('run_id', runId).eq('user_id', userId);
    if (error) throw error;
  },

  getRsvpProfiles: async (runId: string): Promise<Profile[]> => {
    const { data: rsvps } = await supabase.from('run_rsvps').select('user_id').eq('run_id', runId);
    if (!rsvps?.length) return [];

    const allProfiles = await profiles.getAll();
    const profileByUserId = new Map(allProfiles.map((profile) => [profile.user_id, profile]));

    return rsvps.flatMap((rsvp) => {
      const profile = profileByUserId.get(rsvp.user_id);
      return profile ? [profile] : [];
    });
  },
};
