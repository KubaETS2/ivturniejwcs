-- Uruchom cały skrypt w Supabase → SQL Editor → New query → Run.
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  captain text not null check (char_length(captain) between 1 and 40),
  discord text not null check (char_length(discord) between 2 and 80),
  players jsonb not null check (jsonb_typeof(players) = 'array' and jsonb_array_length(players) = 5),
  reserve text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;

-- Użytkownik może wysłać zgłoszenie tylko z własnego konta i jako pending.
drop policy if exists "Users can submit own teams" on public.teams;
create policy "Users can submit own teams" on public.teams
for insert to authenticated with check (auth.uid() = user_id and status = 'pending');

-- Użytkownik widzi wyłącznie własne zgłoszenia.
drop policy if exists "Read own or approved teams" on public.teams;
drop policy if exists "Users can read own teams" on public.teams;
create policy "Users can read own teams" on public.teams
for select to authenticated using (auth.uid() = user_id);

-- Nie dodajemy polityk UPDATE/DELETE ani publicznego odczytu.
-- Dzięki temu dane kontaktowe i składy nie są udostępniane publicznie przez API.
-- Moderacja odbywa się w Supabase Dashboard → Table Editor.
