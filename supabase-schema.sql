-- ===================================================================
-- PRINCESS BURLAND SALON BOOKING APP - SUPABASE DATABASE SCHEMA
-- ===================================================================

-- Disable/Drop if exists to avoid conflicts
-- drop table if exists public.profiles cascade;

-- Create public profiles table matching the auth users
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  preferred_stylist text,
  preferred_services text[],
  preferred_time text,
  profile_picture text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create secure policies
create policy "Allow public read-access to profile basics but restricted to matching owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Allow users to update their own profile only"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create automatic profile creation on signup trigger (Optional helpful utility)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create a profile record when a user signs up
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
