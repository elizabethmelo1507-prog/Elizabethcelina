create table if not exists public.custom_events (
    id bigint primary key generated always as identity,
    title text not null,
    date date not null,
    type text not null,
    color text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
