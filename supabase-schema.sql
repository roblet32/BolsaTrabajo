-- CONFIGURACIÓN DE BASE DE DATOS: BOLSA DE TRABAJO JALPAN

-- 1. TABLA DE PERFILES (Vinculada a la autenticación central de Supabase)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('cliente', 'prestador')),
  name text not null,
  phone text,
  bio text,
  categories text[] default '{}'::text[],
  rate numeric default 0,
  schedule text,
  lat double precision default 21.2185,
  lng double precision default -99.4735,
  rating numeric default 5.0 check (rating >= 1.0 and rating <= 5.0),
  reviews_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar seguridad de nivel de fila (RLS) en profiles
alter table public.profiles enable row level security;

-- Políticas para profiles
create policy "Cualquier usuario puede ver perfiles públicos" 
  on public.profiles for select 
  using (true);

create policy "Los usuarios pueden actualizar su propio perfil" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 2. TABLA DE CITAS (APPOINTMENTS)
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references public.profiles(id) on delete cascade not null,
  cliente_name text not null,
  prestador_id uuid references public.profiles(id) on delete cascade not null,
  prestador_name text not null,
  date date not null,
  time text not null,
  notes text,
  status text not null check (status in ('pendiente', 'aceptada', 'completada', 'cancelada')) default 'pendiente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en appointments
alter table public.appointments enable row level security;

-- Políticas para appointments
create policy "Usuarios pueden ver sus propias citas" 
  on public.appointments for select 
  using (auth.uid() = cliente_id or auth.uid() = prestador_id);

create policy "Clientes pueden agendar citas" 
  on public.appointments for insert 
  with check (auth.uid() = cliente_id);

create policy "Partes involucradas pueden actualizar el estado de la cita" 
  on public.appointments for update 
  using (auth.uid() = cliente_id or auth.uid() = prestador_id);

-- 3. TABLA DE CALIFICACIONES / RESEÑAS (RATINGS)
create table public.ratings (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references public.profiles(id) on delete cascade not null,
  cliente_name text not null,
  prestador_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 5),
  comment text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en ratings
alter table public.ratings enable row level security;

-- Políticas para ratings
create policy "Cualquier persona puede ver calificaciones" 
  on public.ratings for select 
  using (true);

create policy "Clientes autenticados pueden calificar" 
  on public.ratings for insert 
  with check (auth.uid() = cliente_id);

-- 4. TABLA DE CHATS Y MENSAJERÍA
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en chats
alter table public.chats enable row level security;

-- Políticas para chats
create policy "Usuarios pueden leer sus propios mensajes de chat" 
  on public.chats for select 
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Usuarios pueden enviar mensajes" 
  on public.chats for insert 
  with check (auth.uid() = sender_id);


-- DISPARADORES AUTOMÁTICOS (TRIGGERS)

-- Función para insertar automáticamente un perfil al registrar una cuenta de Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, phone, bio, categories, rate, schedule, lat, lng)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Nuevo Usuario'),
    coalesce(new.raw_user_meta_data->>'role', 'cliente'),
    new.raw_user_meta_data->>'phone',
    'Hola, acabo de unirme a la Bolsa de Trabajo de Jalpan.',
    '{}'::text[],
    0,
    'Lunes a Viernes',
    21.2185,
    -99.4735
  );
  return new;
end;
$$ language plpgsql security definer;

-- Crear disparador
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
