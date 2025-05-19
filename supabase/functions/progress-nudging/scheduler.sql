
-- This file contains SQL that would be executed to set up a cron job
-- to run our progress-nudging edge function periodically.
-- To use this, copy and execute this SQL in the Supabase SQL Editor.

-- First, enable the required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the progress nudging function to run daily at 08:00 AM
SELECT cron.schedule(
  'daily-progress-nudging', -- unique job name
  '0 8 * * *',             -- cron expression: at 8:00 AM every day
  $$
  SELECT net.http_post(
    url := 'https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/progress-nudging',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Alternatively, for testing, you can schedule it to run every hour
-- SELECT cron.schedule(
--   'hourly-progress-nudging',
--   '0 * * * *',  -- At minute 0 of every hour
--   $$
--   SELECT net.http_post(
--     url := 'https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/progress-nudging',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
--     body := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );

-- Note: Replace [ANON_KEY] with your actual Supabase anon key before running this SQL
