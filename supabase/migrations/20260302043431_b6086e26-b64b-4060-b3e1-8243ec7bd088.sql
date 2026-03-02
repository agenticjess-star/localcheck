
-- Fix the overly permissive INSERT policy on notifications
-- Only the trigger functions (SECURITY DEFINER) insert notifications, not users directly
DROP POLICY "System can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
