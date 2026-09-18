-- Jeu de données d'exemple pour tester la page /admin.
-- À exécuter manuellement (SQL Editor Supabase ou `psql`), JAMAIS en production.
-- Suppression des exemples : DELETE FROM public.tshirt_orders WHERE initials LIKE 'Z%';

INSERT INTO public.tshirt_orders (group_slug, first_name, last_name, initials, size, created_at) VALUES
  ('u6-u7', 'Adam',    'Nadir',   'ZAN', 'Enfant - 6 ANS',  now() - interval '6 days'),
  ('u6-u7', 'Yassine', 'Saïdi',   'ZYS', 'Enfant - 8 ANS',  now() - interval '6 days'),
  ('u6-u7', 'Léo',     'Bertin',  'ZLB', 'Enfant - 6 ANS',  now() - interval '5 days'),
  ('u8',    'Lucas',   'Blanc',   'ZLB', 'Enfant - 8 ANS',  now() - interval '5 days'),
  ('u8',    'Adam',    'Dubois',  'ZAD', 'Enfant - 8 ANS',  now() - interval '4 days'),
  -- Doublon volontaire : même enfant, deux tailles différentes.
  ('u8',    'Adam',    'Dubois',  'ZAD', 'Enfant - 10 ANS', now() - interval '3 days'),
  ('u9',    'Enzo',    'Diaz',    'ZED', 'Adulte - S',      now() - interval '3 days'),
  ('u9',    'Noah',    'Martin',  'ZNM', 'Enfant - 12 ANS', now() - interval '2 days'),
  ('loisir','Karim',   'Benali',  'ZKB', 'Adulte - L',      now() - interval '2 days'),
  ('loisir','Thomas',  'Girard',  'ZTG', 'Adulte - XL',     now() - interval '1 day');
