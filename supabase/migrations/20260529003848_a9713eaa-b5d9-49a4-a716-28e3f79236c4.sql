
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Auto-grant admin to first user (single-tenant barbershop)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_cents integer NOT NULL,
  duration_minutes integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads services" ON public.services FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- BUSINESS HOURS (0=Sunday, 1=Monday ... 6=Saturday)
CREATE TABLE public.business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  morning_open time,
  morning_close time,
  afternoon_open time,
  afternoon_close time,
  closed boolean NOT NULL DEFAULT false,
  UNIQUE(weekday)
);
GRANT SELECT ON public.business_hours TO anon, authenticated;
GRANT ALL ON public.business_hours TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.business_hours TO authenticated;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads hours" ON public.business_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage hours" ON public.business_hours FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- APPOINTMENTS
CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','cancelled','completed');

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX appointments_starts_at_idx ON public.appointments(starts_at);
GRANT INSERT ON public.appointments TO anon, authenticated;
GRANT SELECT ON public.appointments TO anon, authenticated;
GRANT UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Anyone can create a booking
CREATE POLICY "anyone creates appointment" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Anyone can read slot occupation but NOT customer details (we'll use a view for that)
-- For simplicity restrict reads to admins only; public availability uses a SECURITY DEFINER function
CREATE POLICY "admins read appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete appointments" ON public.appointments FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Function to fetch busy slots for a date (returns only times, not customer info)
CREATE OR REPLACE FUNCTION public.get_busy_slots(_date date)
RETURNS TABLE(starts_at timestamptz, ends_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT starts_at, ends_at FROM public.appointments
  WHERE status IN ('pending','confirmed')
    AND starts_at::date = _date
$$;
GRANT EXECUTE ON FUNCTION public.get_busy_slots(date) TO anon, authenticated;

-- SEED SERVICES
INSERT INTO public.services (name, price_cents, duration_minutes, sort_order) VALUES
('Corte + Barba Express', 7300, 40, 1),
('Corte + Barba + Sobrancelha', 10100, 60, 2),
('Corte + Barboterapia', 8600, 60, 3),
('Corte + Sobrancelha', 5800, 30, 4),
('Barboterapia', 4300, 30, 5),
('Barboterapia + Pezinho', 6100, 30, 6),
('Corte Adulto/Infantil', 4300, 30, 7),
('Acabamento / Pezinho', 1800, 10, 8),
('Barba Mensalista (consulte condições)', 3870, 30, 9),
('Corte + Barba Mensalista (consulte condições)', 7740, 60, 10),
('Barba Express', 3000, 10, 11),
('Camuflagem Barba', 4000, 20, 12),
('Depilação Nariz / Orelha', 2500, 10, 13),
('Desenho / Freestyle', 500, 10, 14),
('Esfoliação Facial', 2000, 10, 15),
('Esfoliação + Máscara Preta', 4500, 20, 16),
('Hidratação', 4500, 20, 17),
('Luzes / Mechas', 13000, 100, 18),
('Platinado', 20000, 150, 19),
('Selagem / Botox', 12000, 60, 20),
('Sobrancelha', 1500, 10, 21),
('Sobrancelha na Pinça', 3000, 10, 22),
('Texturização / Alisamento', 4500, 20, 23),
('Tintura', 5500, 40, 24);

-- SEED HOURS  (Sunday=0 closed)
INSERT INTO public.business_hours (weekday, morning_open, morning_close, afternoon_open, afternoon_close, closed) VALUES
(0, NULL, NULL, NULL, NULL, true),
(1, '09:00','13:00','15:00','19:30', false),
(2, '09:00','12:00','13:30','19:30', false),
(3, '09:00','12:00','13:10','20:00', false),
(4, '09:00','12:00','13:10','20:00', false),
(5, '09:00','12:00','13:10','20:00', false),
(6, '09:00','12:00','13:10','18:00', false);
