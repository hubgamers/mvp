alter table public.matches
  add column stream_url text,
  add constraint match_stream_url_https_check
    check (stream_url is null or stream_url ~ '^https://');

create table public.match_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content varchar(1000) not null,
  created_at timestamptz not null default now(),
  constraint match_message_content_check check (length(trim(content)) between 1 and 1000)
);

create index match_messages_match_created_idx
  on public.match_messages(match_id, created_at);

alter table public.match_messages enable row level security;
grant select, insert on public.match_messages to authenticated;

create or replace function public.is_match_participant(p_match_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.match_slots ms
    join public.tournament_registrations tr on tr.id = ms.registration_id
    join public.team_members tm on tm.team_id = tr.team_id
    where ms.match_id = p_match_id
      and tm.user_id = (select auth.uid())
  ) or exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and public.is_tournament_manager(m.tournament_id)
  );
$$;

grant execute on function public.is_match_participant(uuid) to authenticated;

create policy match_messages_select_participant on public.match_messages
for select to authenticated using (public.is_match_participant(match_id));

create policy match_messages_insert_participant on public.match_messages
for insert to authenticated with check (
  sender_id = (select auth.uid())
  and public.is_match_participant(match_id)
);
