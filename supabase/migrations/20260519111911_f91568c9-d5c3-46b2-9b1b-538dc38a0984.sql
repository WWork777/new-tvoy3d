
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- SERVICE OVERRIDES (JSON blob per slug)
CREATE TABLE public.service_overrides (
  slug text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read services" ON public.service_overrides FOR SELECT USING (true);
CREATE POLICY "admins write services" ON public.service_overrides FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_service_overrides_updated BEFORE UPDATE ON public.service_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CALCULATOR OVERRIDES
CREATE TABLE public.calculator_overrides (
  slug text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.calculator_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read calcs" ON public.calculator_overrides FOR SELECT USING (true);
CREATE POLICY "admins write calcs" ON public.calculator_overrides FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_calc_overrides_updated BEFORE UPDATE ON public.calculator_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PORTFOLIO
CREATE TABLE public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  material text,
  size text,
  description text,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read portfolio" ON public.portfolio_items FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write portfolio" ON public.portfolio_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_portfolio_updated BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  content text NOT NULL,
  avatar_url text,
  rating int NOT NULL DEFAULT 5,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read testimonials" ON public.testimonials FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write testimonials" ON public.testimonials FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CONTACTS
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  href text NOT NULL,
  icon text NOT NULL DEFAULT 'Mail',
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "admins write contacts" ON public.contacts FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LEADS (заявки с сайта)
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text NOT NULL,
  service text,
  material text,
  volume text,
  message text,
  source text DEFAULT 'quote_modal',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit lead" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read leads" ON public.leads FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update leads" ON public.leads FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete leads" ON public.leads FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read public-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-assets');
CREATE POLICY "admins upload public-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update public-assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete public-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
