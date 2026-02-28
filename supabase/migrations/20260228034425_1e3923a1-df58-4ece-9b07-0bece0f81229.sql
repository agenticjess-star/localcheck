
-- Check-ins (who's at the court now)
CREATE TABLE public.check_ins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  court_id text NOT NULL DEFAULT 'court1',
  note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours')
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Check-ins viewable by everyone" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Users can insert own check-ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own check-ins" ON public.check_ins FOR DELETE USING (auth.uid() = user_id);

-- Plans (scheduled sessions)
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  court_id text NOT NULL DEFAULT 'court1',
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans viewable by everyone" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Users can insert own plans" ON public.plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.plans FOR DELETE USING (auth.uid() = user_id);

-- 1v1 Matches
CREATE TABLE public.matches_1v1 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id text NOT NULL DEFAULT 'court1',
  winner_id uuid NOT NULL,
  loser_id uuid NOT NULL,
  winner_score integer NOT NULL DEFAULT 0,
  loser_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.matches_1v1 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches viewable by everyone" ON public.matches_1v1 FOR SELECT USING (true);
CREATE POLICY "Users can insert matches" ON public.matches_1v1 FOR INSERT WITH CHECK (auth.uid() = winner_id);
CREATE POLICY "Loser can confirm match" ON public.matches_1v1 FOR UPDATE USING (auth.uid() = loser_id);

-- Run Events
CREATE TABLE public.run_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id text NOT NULL DEFAULT 'court1',
  start_at timestamptz NOT NULL,
  format text NOT NULL DEFAULT '5v5',
  max_players integer NOT NULL DEFAULT 10,
  note text DEFAULT '',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.run_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Run events viewable by everyone" ON public.run_events FOR SELECT USING (true);
CREATE POLICY "Users can create run events" ON public.run_events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update run events" ON public.run_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete run events" ON public.run_events FOR DELETE USING (auth.uid() = created_by);

-- Run RSVPs
CREATE TABLE public.run_rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.run_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(run_id, user_id)
);
ALTER TABLE public.run_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RSVPs viewable by everyone" ON public.run_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can RSVP" ON public.run_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own RSVP" ON public.run_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for check_ins (live court activity)
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;
