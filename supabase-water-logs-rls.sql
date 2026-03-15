-- Fix: "new row violates row-level security policy for table water_logs"
-- Run in Supabase SQL Editor if water sync fails.

ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own rows
CREATE POLICY "Users can read own water_logs"
ON water_logs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own rows
CREATE POLICY "Users can insert own water_logs"
ON water_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own rows (for upsert)
CREATE POLICY "Users can update own water_logs"
ON water_logs FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
