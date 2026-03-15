-- Physique: Storage bucket + table for synced entries
-- Run this in Supabase SQL Editor.

-- 1) Create storage bucket (or create "physique" in Dashboard > Storage > New bucket, set Public)
-- Then add policy so users can upload/read their own folder:

INSERT INTO storage.buckets (id, name, public)
VALUES ('physique', 'physique', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: users can upload to their own folder (user_id prefix)
CREATE POLICY "Users can upload own physique images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'physique' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own physique images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'physique' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own physique images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'physique' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2) Table for physique entries
CREATE TABLE IF NOT EXISTS physique_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  image_url text NOT NULL,
  weight numeric NOT NULL,
  notes text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_physique_entries_user_id ON physique_entries(user_id);

ALTER TABLE physique_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own physique entries"
ON physique_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own physique entries"
ON physique_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own physique entries"
ON physique_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
