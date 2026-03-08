
-- Courts table
CREATE TABLE public.courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  zip_code text,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courts viewable by everyone" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add courts" ON public.courts FOR INSERT TO authenticated WITH CHECK (auth.uid() = added_by);
CREATE POLICY "Court creator can update" ON public.courts FOR UPDATE TO authenticated USING (auth.uid() = added_by);

-- Add local_court_id to profiles
ALTER TABLE public.profiles ADD COLUMN local_court_id uuid REFERENCES public.courts(id) ON DELETE SET NULL;

-- Enable realtime for courts
ALTER PUBLICATION supabase_realtime ADD TABLE public.courts;
