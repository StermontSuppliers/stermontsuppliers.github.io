-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ref text not null check (char_length(ref) between 3 and 30),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  phone text not null check (char_length(phone) between 8 and 20),
  email text check (char_length(email) <= 200),
  method text not null check (method in ('pickup', 'delivery')),
  county text check (char_length(county) <= 60),
  address text check (char_length(address) <= 200),
  notes text check (char_length(notes) <= 500),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 60),
  subtotal integer not null check (subtotal >= 0),
  status text not null default 'new' check (status in ('new', 'paid', 'confirmed', 'delivered', 'cancelled'))
);

alter table public.orders enable row level security;

-- Anyone on the website can PLACE an order (insert only)
drop policy if exists "anyone can place orders" on public.orders;
create policy "anyone can place orders"
  on public.orders for insert
  to anon, authenticated
  with check (status = 'new' and (user_id is null or user_id = auth.uid()));

-- Logged-in buyers can see only their own orders
drop policy if exists "buyers read own orders" on public.orders;
create policy "buyers read own orders"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

grant insert on public.orders to anon, authenticated;
grant select on public.orders to authenticated;

create index if not exists orders_created_idx on public.orders (created_at desc);
