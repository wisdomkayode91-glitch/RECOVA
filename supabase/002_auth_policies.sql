-- Recova V1 migration: allow signup to create an organization + profile
-- Run this in Supabase SQL Editor AFTER schema.sql

create policy "any signed-in user can create an organization" on organizations
  for insert with check (auth.uid() is not null);

create policy "users can create their own profile" on profiles
  for insert with check (id = auth.uid());
