-- Run this in the Supabase SQL editor before using Module 1.
-- Safe to re-run anytime — tables use "if not exists" and policies are
-- dropped and recreated each run, so running this again won't error out
-- or duplicate anything.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('customer', 'tailor', 'supplier')),
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

-- Users can read their own profile.
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile.
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Note: inserts happen via the backend using the service role key,
-- which bypasses RLS, so no insert policy is required for signup.

-- Module 2: saved garment customizations
create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  garment_type text not null,
  fabric text not null,
  color text not null,
  addons text[] default '{}',
  estimated_price integer not null,
  created_at timestamp with time zone default now()
);

alter table designs enable row level security;

drop policy if exists "Users can view own designs" on designs;
create policy "Users can view own designs"
  on designs for select
  using (auth.uid() = user_id);

-- Inserts happen via the backend using the service role key, which
-- bypasses RLS, so no insert policy is required.

-- Module 3: tailor directory + connection requests
create table if not exists tailors (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  bio text not null,
  city text not null,
  specialties text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  years_experience integer not null default 0,
  starting_price integer,
  created_at timestamp with time zone default now()
);

-- Public directory: anyone can browse tailors, so RLS stays open for reads.
alter table tailors enable row level security;

drop policy if exists "Anyone can view tailors" on tailors;
create policy "Anyone can view tailors"
  on tailors for select
  using (true);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  tailor_id uuid not null references tailors(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default now()
);

alter table connections enable row level security;

drop policy if exists "Customers can view own connection requests" on connections;
create policy "Customers can view own connection requests"
  on connections for select
  using (auth.uid() = customer_id);

-- Inserts for both tables happen via the backend using the service role
-- key, which bypasses RLS, so no insert policy is required.

-- Seed data so the discovery page has something to show right away.
-- Safe to re-run: only inserts if the table is empty.
insert into tailors (business_name, bio, city, specialties, rating, review_count, years_experience, starting_price)
select * from (values
  ('Meena Textiles & Tailoring',
   'Specialists in bridal and occasion wear, blending traditional Tamil silhouettes with modern tailoring. Every piece is hand-finished in-house.',
   'Chennai', array['Bridal wear', 'Kurta & ethnic wear'], 4.8, 120, 15, 3500),
  ('Ravi Custom Stitching',
   'Sharp, structured formalwear for people who want their suits to actually fit. Two-week turnaround on most orders.',
   'Chennai', array['Formal suits', 'Western wear'], 4.6, 85, 10, 4200),
  ('Lakshmi Fashion House',
   'A family-run tailoring house known for quick alterations and beautifully finished kurtas and ethnic sets.',
   'Madurai', array['Kurta & ethnic wear', 'Alterations'], 4.7, 64, 12, 1200),
  ('StitchCraft Studio',
   'Contemporary western wear and playful kidswear, made to grow with your child. Small-batch, detail-oriented work.',
   'Coimbatore', array['Western wear', 'Kids wear'], 4.5, 40, 6, 900),
  ('Anand Master Tailors',
   'Twenty years of formalwear tailoring for Chennai''s corporate crowd. Precision fitting, classic construction.',
   'Chennai', array['Formal suits', 'Alterations'], 4.9, 150, 20, 3800),
  ('Priya Boutique',
   'Bridal and party wear with an eye for embroidery and detail work, from a boutique that''s been dressing Madurai brides for years.',
   'Madurai', array['Bridal wear', 'Western wear'], 4.4, 30, 5, 2800)
) as seed(business_name, bio, city, specialties, rating, review_count, years_experience, starting_price)
where not exists (select 1 from tailors);

-- Module 4: orders + status tracking
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  tailor_id uuid not null references tailors(id),
  design_id uuid references designs(id) on delete set null,
  garment_type text not null,
  fabric text not null,
  color text not null,
  addons text[] default '{}',
  estimated_price integer not null,
  delivery_address text not null,
  notes text,
  status text not null default 'submitted'
    check (status in ('submitted', 'in_progress', 'stitching', 'ready', 'delivered')),
  created_at timestamp with time zone default now()
);

alter table orders enable row level security;

drop policy if exists "Customers can view own orders" on orders;
create policy "Customers can view own orders"
  on orders for select
  using (auth.uid() = customer_id);

drop policy if exists "Customers can update own orders" on orders;
create policy "Customers can update own orders"
  on orders for update
  using (auth.uid() = customer_id);

-- Inserts happen via the backend using the service role key, which
-- bypasses RLS, so no insert policy is required.

-- Module 5: mock payments
alter table orders add column if not exists payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid', 'paid', 'cod_pending'));

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  method text not null check (method in ('upi', 'card', 'cod')),
  amount integer not null,
  status text not null check (status in ('pending', 'success', 'failed')),
  transaction_ref text,
  created_at timestamp with time zone default now()
);

alter table payments enable row level security;

drop policy if exists "Customers can view own payments" on payments;
create policy "Customers can view own payments"
  on payments for select
  using (auth.uid() = customer_id);

-- Inserts happen via the backend using the service role key, which
-- bypasses RLS, so no insert policy is required.

-- Module 7: reviews & ratings
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  tailor_id uuid not null references tailors(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table reviews enable row level security;

-- Reviews are public, like a real storefront's reviews would be.
drop policy if exists "Anyone can view reviews" on reviews;
create policy "Anyone can view reviews"
  on reviews for select
  using (true);

-- Inserts happen via the backend using the service role key, which
-- bypasses RLS, so no insert policy is required.

-- Module 8: tailor & admin dashboards
-- Allow an 'admin' role alongside the existing three. There's no signup
-- path for it on purpose — promote a user to admin manually in the
-- Table Editor (profiles table, role column) once you have an account
-- you want to use for testing the admin dashboard.
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('customer', 'tailor', 'supplier', 'admin'));

-- Link a tailor row to a real logged-in account, so a tailor can manage
-- their own listing and orders. Seeded demo tailors keep user_id = null
-- (they're just browsable listings, not logins) — only real signups that
-- set up a tailor profile through the dashboard get one.
alter table tailors add column if not exists user_id uuid references auth.users(id) on delete set null;
create unique index if not exists tailors_user_id_unique on tailors(user_id) where user_id is not null;
