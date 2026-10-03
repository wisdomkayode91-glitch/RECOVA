-- Recova V0 schema
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create extension if not exists "uuid-ossp";

-- ORGANIZATIONS (the tenant)
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  currency text not null default 'NGN',
  timezone text not null default 'Africa/Lagos',
  created_at timestamptz not null default now()
);

-- PROFILES (links a Supabase auth user to an organization)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

-- CUSTOMERS
create table customers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  customer_reference text,
  created_at timestamptz not null default now()
);

-- INVOICES
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  invoice_number text not null,
  currency text not null default 'NGN',
  total_amount numeric(14,2) not null check (total_amount >= 0),
  status text not null default 'draft',
  issue_date date,
  due_date date,
  created_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

-- PAYMENTS (a payment is its own event, not tied to one invoice)
create table payments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'NGN',
  method text not null default 'manual',
  reference text,
  payment_date date not null default current_date,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- ALLOCATIONS (links a payment to one or more invoices)
create table allocations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  payment_id uuid not null references payments(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- Row Level Security: every table only visible to members of the same organization
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table allocations enable row level security;

create policy "org members can view their org" on organizations
  for select using (id in (select organization_id from profiles where profiles.id = auth.uid()));

create policy "users can view their own profile" on profiles
  for select using (id = auth.uid());

create policy "org members can manage their customers" on customers
  for all using (organization_id in (select organization_id from profiles where profiles.id = auth.uid()));

create policy "org members can manage their invoices" on invoices
  for all using (organization_id in (select organization_id from profiles where profiles.id = auth.uid()));

create policy "org members can manage their payments" on payments
  for all using (organization_id in (select organization_id from profiles where profiles.id = auth.uid()));

create policy "org members can manage their allocations" on allocations
  for all using (organization_id in (select organization_id from profiles where profiles.id = auth.uid()));
  
