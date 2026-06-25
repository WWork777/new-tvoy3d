
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Restrict listing of files (public access via signed/public URL still works)
DROP POLICY IF EXISTS "public read public-assets" ON storage.objects;
CREATE POLICY "admins list public-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
