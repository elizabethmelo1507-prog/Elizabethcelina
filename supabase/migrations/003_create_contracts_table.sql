-- Create the contracts table
create table if not exists public.contracts (
    id bigint primary key generated always as identity,
    title text not null,
    client text not null,
    client_full_name text,
    value text,
    status text not null default 'Rascunho',
    signed_date text,
    full_data jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contracts enable row level security;

-- Admin access (all actions)
create policy "Allow all actions for authenticated users"
on public.contracts
for all 
to authenticated
using (true)
with check (true);

-- Public read access (for sharing links)
-- In production, we'd use a UUID or share token, but based on the existing pattern:
create policy "Allow public read access"
on public.contracts
for select
to anon
using (true);

-- Update access for anon (for signing)
create policy "Allow public update access for signing"
on public.contracts
for update
to anon
using (true)
with check (true);

-- Grant privileges
grant all on table public.contracts to authenticated;
grant all on table public.contracts to anon;
grant usage on sequence contracts_id_seq to authenticated;
grant usage on sequence contracts_id_seq to anon;
