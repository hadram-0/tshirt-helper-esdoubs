CREATE TABLE public.tshirt_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_slug text NOT NULL CHECK (group_slug IN ('u6-u7','u8','u9','loisir')),
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 60),
  initials text NOT NULL CHECK (char_length(initials) BETWEEN 1 AND 4),
  size text NOT NULL CHECK (char_length(size) BETWEEN 1 AND 40),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.tshirt_orders TO anon, authenticated;
GRANT ALL ON public.tshirt_orders TO service_role;
ALTER TABLE public.tshirt_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a request" ON public.tshirt_orders FOR INSERT TO anon, authenticated WITH CHECK (true);