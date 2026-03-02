
-- 1. Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'match',
  message TEXT NOT NULL,
  match_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 2. Change default match status to 'confirmed' (auto-apply)
ALTER TABLE public.matches_1v1 ALTER COLUMN status SET DEFAULT 'confirmed';

-- 3. Function to apply Elo on match insert
CREATE OR REPLACE FUNCTION public.apply_elo_on_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  winner_rating INT;
  loser_rating INT;
  expected_winner FLOAT;
  expected_loser FLOAT;
  k INT := 32;
  new_winner_rating INT;
  new_loser_rating INT;
  winner_name TEXT;
  loser_name TEXT;
BEGIN
  -- Get current ratings
  SELECT rating, name INTO winner_rating, winner_name FROM profiles WHERE user_id = NEW.winner_id;
  SELECT rating, name INTO loser_rating, loser_name FROM profiles WHERE user_id = NEW.loser_id;

  IF winner_rating IS NULL OR loser_rating IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate Elo
  expected_winner := 1.0 / (1.0 + power(10.0, (loser_rating - winner_rating)::FLOAT / 400.0));
  expected_loser := 1.0 - expected_winner;

  new_winner_rating := winner_rating + round(k * (1.0 - expected_winner));
  new_loser_rating := loser_rating + round(k * (0.0 - expected_loser));

  -- Ensure minimum rating of 100
  IF new_loser_rating < 100 THEN new_loser_rating := 100; END IF;

  -- Apply ratings
  UPDATE profiles SET rating = new_winner_rating WHERE user_id = NEW.winner_id;
  UPDATE profiles SET rating = new_loser_rating WHERE user_id = NEW.loser_id;

  -- Create notification for the opponent (loser gets notified they were tagged)
  INSERT INTO notifications (user_id, type, message, match_id)
  VALUES (
    NEW.loser_id,
    'match',
    winner_name || ' logged a ' || NEW.winner_score || '–' || NEW.loser_score || ' win against you. Dispute if incorrect.',
    NEW.id
  );

  -- Also notify winner about the Elo change
  INSERT INTO notifications (user_id, type, message, match_id)
  VALUES (
    NEW.winner_id,
    'match',
    'Your match vs ' || loser_name || ' (' || NEW.winner_score || '–' || NEW.loser_score || ') updated your rating to ' || new_winner_rating || '.',
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- 4. Function to reverse Elo on dispute
CREATE OR REPLACE FUNCTION public.reverse_elo_on_dispute()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  winner_rating INT;
  loser_rating INT;
  expected_winner FLOAT;
  k INT := 32;
  elo_delta INT;
  winner_name TEXT;
  loser_name TEXT;
BEGIN
  -- Only fire when status changes TO 'disputed'
  IF OLD.status = 'disputed' OR NEW.status != 'disputed' THEN
    RETURN NEW;
  END IF;

  SELECT rating, name INTO winner_rating, winner_name FROM profiles WHERE user_id = NEW.winner_id;
  SELECT rating, name INTO loser_rating, loser_name FROM profiles WHERE user_id = NEW.loser_id;

  IF winner_rating IS NULL OR loser_rating IS NULL THEN
    RETURN NEW;
  END IF;

  -- Reverse the Elo: recalculate what was applied and undo it
  -- We approximate by recalculating from current ratings
  expected_winner := 1.0 / (1.0 + power(10.0, (loser_rating - winner_rating)::FLOAT / 400.0));
  elo_delta := round(k * (1.0 - expected_winner));

  UPDATE profiles SET rating = GREATEST(100, winner_rating - elo_delta) WHERE user_id = NEW.winner_id;
  UPDATE profiles SET rating = loser_rating + elo_delta WHERE user_id = NEW.loser_id;

  -- Notify both players
  INSERT INTO notifications (user_id, type, message, match_id)
  VALUES (
    NEW.loser_id,
    'match',
    'Your dispute of the match vs ' || winner_name || ' has been accepted. Ratings reversed.',
    NEW.id
  );

  INSERT INTO notifications (user_id, type, message, match_id)
  VALUES (
    NEW.winner_id,
    'match',
    loser_name || ' disputed the match (' || NEW.winner_score || '–' || NEW.loser_score || '). Ratings reversed pending resolution.',
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- 5. Create triggers
CREATE TRIGGER on_match_insert_apply_elo
  AFTER INSERT ON public.matches_1v1
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_elo_on_match();

CREATE TRIGGER on_match_dispute_reverse_elo
  AFTER UPDATE ON public.matches_1v1
  FOR EACH ROW
  EXECUTE FUNCTION public.reverse_elo_on_dispute();
