
-- Fix ALL RLS policies: drop restrictive, recreate as permissive

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- check_ins
DROP POLICY IF EXISTS "Check-ins viewable by everyone" ON public.check_ins;
DROP POLICY IF EXISTS "Users can insert own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can delete own check-ins" ON public.check_ins;
CREATE POLICY "Check-ins viewable by everyone" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Users can insert own check-ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own check-ins" ON public.check_ins FOR DELETE USING (auth.uid() = user_id);

-- plans
DROP POLICY IF EXISTS "Plans viewable by everyone" ON public.plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can update own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON public.plans;
CREATE POLICY "Plans viewable by everyone" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Users can insert own plans" ON public.plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.plans FOR DELETE USING (auth.uid() = user_id);

-- matches_1v1
DROP POLICY IF EXISTS "Matches viewable by everyone" ON public.matches_1v1;
DROP POLICY IF EXISTS "Users can insert matches" ON public.matches_1v1;
DROP POLICY IF EXISTS "Loser can confirm match" ON public.matches_1v1;
CREATE POLICY "Matches viewable by everyone" ON public.matches_1v1 FOR SELECT USING (true);
CREATE POLICY "Users can insert matches" ON public.matches_1v1 FOR INSERT WITH CHECK (auth.uid() = winner_id OR auth.uid() = loser_id);
CREATE POLICY "Match participants can update" ON public.matches_1v1 FOR UPDATE USING (auth.uid() = winner_id OR auth.uid() = loser_id);

-- run_events
DROP POLICY IF EXISTS "Run events viewable by everyone" ON public.run_events;
DROP POLICY IF EXISTS "Users can create run events" ON public.run_events;
DROP POLICY IF EXISTS "Creator can update run events" ON public.run_events;
DROP POLICY IF EXISTS "Creator can delete run events" ON public.run_events;
CREATE POLICY "Run events viewable by everyone" ON public.run_events FOR SELECT USING (true);
CREATE POLICY "Users can create run events" ON public.run_events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update run events" ON public.run_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete run events" ON public.run_events FOR DELETE USING (auth.uid() = created_by);

-- run_rsvps
DROP POLICY IF EXISTS "RSVPs viewable by everyone" ON public.run_rsvps;
DROP POLICY IF EXISTS "Users can RSVP" ON public.run_rsvps;
DROP POLICY IF EXISTS "Users can remove own RSVP" ON public.run_rsvps;
CREATE POLICY "RSVPs viewable by everyone" ON public.run_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can RSVP" ON public.run_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own RSVP" ON public.run_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Create missing trigger for auto-creating profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
