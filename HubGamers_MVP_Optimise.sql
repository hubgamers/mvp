-- ============================================================================
-- HubGamers MVP+ — PostgreSQL / Supabase
-- Version: 2.0
-- Objectif : structures, équipes, tournois multi-phases et Studio streaming.
--
-- IMPORTANT
-- 1. Script de référence pour une nouvelle base / un schéma vide.
-- 2. Ne pas exécuter tel quel sur une base déjà utilisée : créer une migration
--    progressive et migrer les données avant de supprimer/renommer des tables.
-- 3. Les comptes sont ceux de Supabase Auth (auth.users). public.profiles stocke
--    uniquement les données publiques du profil.
-- 4. Les règles métier complexes (validation d'un résultat, qualification,
--    génération d'arbre) doivent aussi être contrôlées côté serveur/RPC.
-- ============================================================================

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- 1. TYPES
-- ---------------------------------------------------------------------------

create type public.member_role as enum ('OWNER', 'ADMIN', 'MEMBER');
create type public.team_member_role as enum ('MANAGER', 'CAPTAIN', 'PLAYER');
create type public.platform as enum ('PC', 'PLAYSTATION', 'XBOX', 'SWITCH', 'MOBILE', 'CROSS_PLATFORM', 'OTHER');
create type public.tournament_status as enum ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
create type public.registration_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED', 'CHECKED_IN', 'WITHDRAWN');
create type public.stage_type as enum ('GROUPS', 'ROUND_ROBIN', 'SWISS', 'SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'LADDER', 'CUSTOM');
create type public.stage_status as enum ('DRAFT', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type public.match_status as enum ('PENDING', 'READY', 'LIVE', 'AWAITING_RESULT_CONFIRMATION', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'BYE');
create type public.match_side as enum ('A', 'B');
create type public.match_slot_source as enum ('REGISTRATION', 'PREVIOUS_MATCH', 'GROUP_RANK', 'MANUAL');
create type public.qualification_outcome as enum ('WINNER', 'LOSER');
create type public.invitation_status as enum ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');
create type public.invitation_target_type as enum ('STRUCTURE', 'TEAM', 'TOURNAMENT');
create type public.overlay_scene_type as enum ('MATCH', 'BRACKET', 'STANDINGS', 'LOWER_THIRD', 'COUNTDOWN', 'UP_NEXT', 'CUSTOM');

-- ---------------------------------------------------------------------------
-- 2. PROFILS, STRUCTURES ET ÉQUIPES
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username varchar(32) unique,
  display_name varchar(80),
  avatar_url text,
  bio varchar(500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username ~ '^[A-Za-z0-9_.-]{3,32}$')
);

create table public.structures (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  logo_url text,
  banner_url text,
  website_url text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint structures_name_not_blank check (length(trim(name)) > 0)
);

create table public.structure_members (
  structure_id uuid not null references public.structures(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'MEMBER',
  joined_at timestamptz not null default now(),
  primary key (structure_id, user_id)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(120),
  game varchar(100) not null,
  platform public.platform not null default 'PC',
  logo_url text,
  description text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint teams_name_not_blank check (length(trim(name)) > 0),
  constraint teams_game_not_blank check (length(trim(game)) > 0)
);

create unique index teams_slug_unique_idx on public.teams (lower(slug)) where slug is not null and deleted_at is null;
create index teams_game_platform_idx on public.teams (lower(game), platform) where deleted_at is null;

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.team_member_role not null default 'PLAYER',
  jersey_number smallint,
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id),
  constraint team_members_jersey_number_check check (jersey_number is null or jersey_number between 0 and 999)
);

-- Une équipe peut être rattachée à une structure. La contrainte unique évite
-- les rattachements multiples ambigus dans le MVP ; à retirer si multi-structure voulu.
create table public.structure_teams (
  structure_id uuid not null references public.structures(id) on delete cascade,
  team_id uuid not null unique references public.teams(id) on delete cascade,
  linked_at timestamptz not null default now(),
  primary key (structure_id, team_id)
);

create index structure_members_user_idx on public.structure_members(user_id);
create index team_members_user_idx on public.team_members(user_id);
create index structure_teams_team_idx on public.structure_teams(team_id);

-- ---------------------------------------------------------------------------
-- 3. TOURNOIS ET INSCRIPTIONS
-- ---------------------------------------------------------------------------

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  slug varchar(180) not null unique,
  description text,
  rules text,
  game varchar(100) not null,
  platform public.platform not null default 'PC',
  status public.tournament_status not null default 'DRAFT',
  organizer_structure_id uuid references public.structures(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  min_teams integer not null default 2,
  max_teams integer,
  team_size_min smallint,
  team_size_max smallint,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  check_in_opens_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone varchar(64) not null default 'UTC',
  is_public boolean not null default true,
  is_free boolean not null default true,
  prize_pool numeric(12,2),
  prize_currency char(3),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint tournaments_name_not_blank check (length(trim(name)) > 0),
  constraint tournaments_game_not_blank check (length(trim(game)) > 0),
  constraint tournaments_min_teams_check check (min_teams >= 2),
  constraint tournaments_max_teams_check check (max_teams is null or max_teams >= min_teams),
  constraint tournaments_team_size_check check (
    team_size_min is null or team_size_max is null or team_size_max >= team_size_min
  ),
  constraint tournaments_dates_check check (
    registration_opens_at is null or registration_closes_at is null or registration_closes_at >= registration_opens_at
  ),
  constraint tournaments_prize_check check (prize_pool is null or prize_pool >= 0)
);

create table public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  registered_by uuid not null references public.profiles(id) on delete restrict,
  status public.registration_status not null default 'PENDING',
  seed integer,
  checked_in_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  public_note text,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, team_id),
  constraint registration_seed_check check (seed is null or seed > 0)
);

create index tournaments_status_start_idx on public.tournaments(status, starts_at) where deleted_at is null;
create index tournaments_creator_idx on public.tournaments(created_by);
create index registrations_tournament_status_idx on public.tournament_registrations(tournament_id, status);
create index registrations_team_idx on public.tournament_registrations(team_id);

-- ---------------------------------------------------------------------------
-- 4. PHASES, GROUPES, CLASSEMENTS ET TRANSITIONS
-- ---------------------------------------------------------------------------

create table public.tournament_stages (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name varchar(100) not null,
  stage_order integer not null,
  stage_type public.stage_type not null,
  status public.stage_status not null default 'DRAFT',
  config jsonb not null default '{}'::jsonb,
  -- Exemples de config : {"group_count":4,"qualifiers_per_group":2}
  -- ou {"best_of":3,"third_place_match":true,"seeding":"standard"}
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, stage_order),
  constraint stage_order_positive check (stage_order > 0),
  constraint stage_name_not_blank check (length(trim(name)) > 0)
);

create table public.stage_groups (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.tournament_stages(id) on delete cascade,
  name varchar(80) not null,
  group_order integer not null,
  config jsonb not null default '{}'::jsonb,
  unique (stage_id, group_order),
  unique (stage_id, name),
  constraint stage_group_order_positive check (group_order > 0)
);

-- Équipe engagée dans une phase et éventuellement dans un groupe.
-- Permet de conserver les participants qualifiés indépendamment de l'inscription initiale.
create table public.stage_entries (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.tournament_stages(id) on delete cascade,
  registration_id uuid not null references public.tournament_registrations(id) on delete cascade,
  group_id uuid references public.stage_groups(id) on delete set null,
  seed integer,
  qualification_source text,
  created_at timestamptz not null default now(),
  unique (stage_id, registration_id),
  constraint stage_entry_seed_check check (seed is null or seed > 0)
);

-- Règles explicites entre deux phases : par exemple top 2 de chaque groupe vers
-- le bracket principal, les autres vers le bracket secondaire.
create table public.stage_transitions (
  id uuid primary key default gen_random_uuid(),
  from_stage_id uuid not null references public.tournament_stages(id) on delete cascade,
  to_stage_id uuid not null references public.tournament_stages(id) on delete cascade,
  name varchar(100) not null,
  source_scope text not null default 'OVERALL',
  -- source_scope : OVERALL, GROUP, MATCH
  source_group_id uuid references public.stage_groups(id) on delete cascade,
  qualification_rule jsonb not null,
  -- Exemples :
  -- {"type":"RANK_RANGE","from":1,"to":2}
  -- {"type":"RANK_RANGE","from":3,"to":4}
  -- {"type":"TOP_N_OVERALL","count":8}
  -- {"type":"MATCH_OUTCOME","outcome":"WINNER"}
  -- {"type":"MANUAL"}
  target_group_id uuid references public.stage_groups(id) on delete set null,
  target_seed_rule jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint stage_transition_not_self check (from_stage_id <> to_stage_id),
  constraint stage_transition_scope_check check (source_scope in ('OVERALL', 'GROUP', 'MATCH'))
);

create index stages_tournament_order_idx on public.tournament_stages(tournament_id, stage_order);
create index stage_groups_stage_idx on public.stage_groups(stage_id);
create index stage_entries_stage_group_idx on public.stage_entries(stage_id, group_id);
create index stage_transitions_from_idx on public.stage_transitions(from_stage_id);
create index stage_transitions_to_idx on public.stage_transitions(to_stage_id);

-- ---------------------------------------------------------------------------
-- 5. MATCHS ET EMPLACEMENTS DE PARTICIPANTS
-- ---------------------------------------------------------------------------

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  stage_id uuid not null references public.tournament_stages(id) on delete cascade,
  group_id uuid references public.stage_groups(id) on delete set null,
  name varchar(120),
  round_number integer,
  match_order integer not null,
  status public.match_status not null default 'PENDING',
  best_of smallint not null default 1,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  winner_registration_id uuid references public.tournament_registrations(id) on delete set null,
  reported_by uuid references public.profiles(id) on delete set null,
  confirmed_by uuid references public.profiles(id) on delete set null,
  result_note text,
  metadata jsonb not null default '{}'::jsonb,
  stream_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stage_id, group_id, match_order),
  constraint match_order_positive check (match_order > 0),
  constraint match_round_positive check (round_number is null or round_number > 0),
  constraint match_best_of_check check (best_of > 0 and best_of % 2 = 1),
  constraint match_stream_url_https_check check (stream_url is null or stream_url ~ '^https://')
);

-- Les participants sont des slots, pas deux colonnes figées dans matches.
-- Un slot peut être résolu manuellement, par le gagnant/perdant d'un match,
-- ou par un rang d'un groupe. Cela permet les brackets et les phases chaînées.
create table public.match_slots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  side public.match_side not null,
  registration_id uuid references public.tournament_registrations(id) on delete set null,
  source public.match_slot_source not null default 'MANUAL',
  source_match_id uuid references public.matches(id) on delete set null,
  source_outcome public.qualification_outcome,
  source_stage_id uuid references public.tournament_stages(id) on delete set null,
  source_group_id uuid references public.stage_groups(id) on delete set null,
  source_rank integer,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (match_id, side),
  constraint match_slot_source_check check (
    (source = 'PREVIOUS_MATCH' and source_match_id is not null and source_outcome is not null)
    or (source = 'GROUP_RANK' and source_stage_id is not null and source_rank is not null)
    or (source = 'REGISTRATION' and registration_id is not null)
    or source = 'MANUAL'
  ),
  constraint match_slot_rank_check check (source_rank is null or source_rank > 0)
);

-- Score détaillé par carte / manche / partie (utile pour BO3/BO5 et esport).
create table public.match_games (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  game_number smallint not null,
  score_a integer not null default 0,
  score_b integer not null default 0,
  winner_side public.match_side,
  map_name varchar(100),
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique (match_id, game_number),
  constraint match_game_number_check check (game_number > 0),
  constraint match_game_scores_check check (score_a >= 0 and score_b >= 0)
);

create table public.match_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content varchar(1000) not null,
  created_at timestamptz not null default now(),
  constraint match_message_content_check check (length(trim(content)) between 1 and 1000)
);
grant select, insert on public.match_messages to authenticated;

-- Snapshot de classement calculé par le moteur de tournoi. Les statistiques
-- peuvent être recalculées depuis les matchs ; cette table accélère l'affichage.
create table public.stage_standings (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.tournament_stages(id) on delete cascade,
  group_id uuid references public.stage_groups(id) on delete cascade,
  registration_id uuid not null references public.tournament_registrations(id) on delete cascade,
  rank integer,
  played integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  points numeric(10,2) not null default 0,
  score_for integer not null default 0,
  score_against integer not null default 0,
  tiebreakers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (stage_id, group_id, registration_id),
  constraint standings_rank_check check (rank is null or rank > 0),
  constraint standings_stats_check check (played >= 0 and wins >= 0 and draws >= 0 and losses >= 0)
);

create index matches_tournament_status_idx on public.matches(tournament_id, status);
create index matches_stage_round_order_idx on public.matches(stage_id, round_number, match_order);
create index matches_schedule_idx on public.matches(scheduled_at) where scheduled_at is not null;
create index match_slots_registration_idx on public.match_slots(registration_id);
create index match_slots_source_match_idx on public.match_slots(source_match_id);
create index match_games_match_idx on public.match_games(match_id, game_number);
create index match_messages_match_created_idx on public.match_messages(match_id, created_at);
create index standings_stage_group_rank_idx on public.stage_standings(stage_id, group_id, rank);

-- ---------------------------------------------------------------------------
-- 6. INVITATIONS
-- ---------------------------------------------------------------------------

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  target_type public.invitation_target_type not null,
  target_id uuid not null,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  role varchar(32),
  token_hash text not null unique,
  status public.invitation_status not null default 'PENDING',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index invitations_email_status_idx on public.invitations(email, status);
create index invitations_target_idx on public.invitations(target_type, target_id);

-- citext est utilisé pour comparer les emails sans tenir compte de la casse.

-- ---------------------------------------------------------------------------
-- 7. HUBGAMERS STUDIO / OVERLAYS
-- ---------------------------------------------------------------------------

create table public.studio_projects (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique references public.tournaments(id) on delete cascade,
  name varchar(120) not null default 'Studio',
  theme jsonb not null default '{"primary":"#CCFF00","secondary":"#1E293B","background":"#0F172A"}'::jsonb,
  logo_url text,
  banner_url text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.studio_scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.studio_projects(id) on delete cascade,
  name varchar(100) not null,
  scene_type public.overlay_scene_type not null default 'MATCH',
  slug varchar(120) not null,
  is_enabled boolean not null default true,
  is_default boolean not null default false,
  -- Configuration de présentation : dimensions, modules, positions, typographie.
  layout jsonb not null default '{}'::jsonb,
  -- Conserver les données de présentation ici, jamais des secrets d'accès.
  data_binding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slug)
);

create table public.studio_public_tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.studio_projects(id) on delete cascade,
  scene_id uuid references public.studio_scenes(id) on delete cascade,
  token_hash text not null unique,
  label varchar(100),
  is_active boolean not null default true,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index studio_scenes_project_enabled_idx on public.studio_scenes(project_id, is_enabled);
create index studio_tokens_project_idx on public.studio_public_tokens(project_id) where is_active;

-- ---------------------------------------------------------------------------
-- 8. HISTORIQUE ET MISE À JOUR DES TIMESTAMPS
-- ---------------------------------------------------------------------------

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type varchar(80) not null,
  entity_id uuid,
  action varchar(80) not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger structures_set_updated_at before update on public.structures
for each row execute function public.set_updated_at();
create trigger teams_set_updated_at before update on public.teams
for each row execute function public.set_updated_at();
create trigger tournaments_set_updated_at before update on public.tournaments
for each row execute function public.set_updated_at();
create trigger registrations_set_updated_at before update on public.tournament_registrations
for each row execute function public.set_updated_at();
create trigger stages_set_updated_at before update on public.tournament_stages
for each row execute function public.set_updated_at();
create trigger matches_set_updated_at before update on public.matches
for each row execute function public.set_updated_at();
create trigger studio_projects_set_updated_at before update on public.studio_projects
for each row execute function public.set_updated_at();
create trigger studio_scenes_set_updated_at before update on public.studio_scenes
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. RLS SUPABASE
-- ---------------------------------------------------------------------------
-- Principe : public read uniquement pour les objets publics ; toute mutation
-- est liée à un rôle vérifié. Les règles de tournoi/match plus complexes sont
-- idéalement exposées via RPC SECURITY DEFINER avec validation transactionnelle.

alter table public.profiles enable row level security;
alter table public.structures enable row level security;
alter table public.structure_members enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.structure_teams enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.tournament_stages enable row level security;
alter table public.stage_groups enable row level security;
alter table public.stage_entries enable row level security;
alter table public.stage_transitions enable row level security;
alter table public.matches enable row level security;
alter table public.match_slots enable row level security;
alter table public.match_games enable row level security;
alter table public.match_messages enable row level security;
alter table public.stage_standings enable row level security;
alter table public.invitations enable row level security;
alter table public.studio_projects enable row level security;
alter table public.studio_scenes enable row level security;
alter table public.studio_public_tokens enable row level security;
alter table public.audit_logs enable row level security;

-- Helpers SECURITY DEFINER évitent les récursions RLS sur les tables de membres.
create or replace function public.is_structure_admin(p_structure_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.structure_members sm
    where sm.structure_id = p_structure_id
      and sm.user_id = (select auth.uid())
      and sm.role in ('OWNER', 'ADMIN')
  );
$$;

create or replace function public.is_team_manager(p_team_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.team_id = p_team_id
      and tm.user_id = (select auth.uid())
      and tm.role in ('MANAGER', 'CAPTAIN')
  ) or exists (
    select 1 from public.structure_teams st
    join public.structure_members sm on sm.structure_id = st.structure_id
    where st.team_id = p_team_id
      and sm.user_id = (select auth.uid())
      and sm.role in ('OWNER', 'ADMIN')
  );
$$;

create or replace function public.is_tournament_manager(p_tournament_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = p_tournament_id
      and (
        t.created_by = (select auth.uid())
        or (t.organizer_structure_id is not null and public.is_structure_admin(t.organizer_structure_id))
      )
  );
$$;

grant execute on function public.is_structure_admin(uuid) to authenticated;
grant execute on function public.is_team_manager(uuid) to authenticated;
grant execute on function public.is_tournament_manager(uuid) to authenticated;

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

-- Profils : visibles aux utilisateurs authentifiés, modifiables par leur propriétaire.
create policy profiles_select_authenticated on public.profiles
for select to authenticated using (true);
create policy profiles_insert_self on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_self on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Structures
create policy structures_select_public_or_member on public.structures
for select using (
  (is_public and deleted_at is null)
  or created_by = (select auth.uid())
  or exists (select 1 from public.structure_members sm where sm.structure_id = id and sm.user_id = (select auth.uid()))
);
create policy structures_insert_self on public.structures
for insert to authenticated with check (created_by = (select auth.uid()));
create policy structures_update_admin on public.structures
for update to authenticated using (public.is_structure_admin(id) or created_by = (select auth.uid()))
with check (public.is_structure_admin(id) or created_by = (select auth.uid()));
create policy structures_delete_admin on public.structures
for delete to authenticated using (public.is_structure_admin(id) or created_by = (select auth.uid()));

create policy structure_members_select_related on public.structure_members
for select to authenticated using (
  user_id = (select auth.uid()) or public.is_structure_admin(structure_id)
);
create policy structure_members_insert_admin_or_self_owner on public.structure_members
for insert to authenticated with check (
  public.is_structure_admin(structure_id)
  or (user_id = (select auth.uid()) and role = 'OWNER'
      and exists (select 1 from public.structures s where s.id = structure_id and s.created_by = (select auth.uid())))
);
create policy structure_members_update_admin on public.structure_members
for update to authenticated using (public.is_structure_admin(structure_id))
with check (public.is_structure_admin(structure_id));
create policy structure_members_delete_admin_or_self on public.structure_members
for delete to authenticated using (public.is_structure_admin(structure_id) or user_id = (select auth.uid()));

-- Équipes et membres
create policy teams_select_public_or_related on public.teams
for select using (
  (is_public and deleted_at is null)
  or created_by = (select auth.uid())
  or exists (select 1 from public.team_members tm where tm.team_id = id and tm.user_id = (select auth.uid()))
  or exists (
    select 1 from public.structure_teams st join public.structure_members sm on sm.structure_id = st.structure_id
    where st.team_id = id and sm.user_id = (select auth.uid())
  )
);
create policy teams_insert_self on public.teams
for insert to authenticated with check (created_by = (select auth.uid()));
create policy teams_update_manager on public.teams
for update to authenticated using (public.is_team_manager(id) or created_by = (select auth.uid()))
with check (public.is_team_manager(id) or created_by = (select auth.uid()));
create policy teams_delete_manager on public.teams
for delete to authenticated using (public.is_team_manager(id) or created_by = (select auth.uid()));

create policy team_members_select_related on public.team_members
for select to authenticated using (
  user_id = (select auth.uid()) or public.is_team_manager(team_id)
);
create policy team_members_insert_manager_or_self on public.team_members
for insert to authenticated with check (
  public.is_team_manager(team_id) or user_id = (select auth.uid())
);
create policy team_members_update_manager on public.team_members
for update to authenticated using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));
create policy team_members_delete_manager_or_self on public.team_members
for delete to authenticated using (public.is_team_manager(team_id) or user_id = (select auth.uid()));

create policy structure_teams_select_member on public.structure_teams
for select to authenticated using (
  public.is_structure_admin(structure_id)
  or exists (select 1 from public.structure_members sm where sm.structure_id = structure_id and sm.user_id = (select auth.uid()))
);
create policy structure_teams_insert_admin on public.structure_teams
for insert to authenticated with check (public.is_structure_admin(structure_id));
create policy structure_teams_delete_admin on public.structure_teams
for delete to authenticated using (public.is_structure_admin(structure_id));

-- Tournois
create policy tournaments_select_public_or_manager on public.tournaments
for select using (
  (is_public and deleted_at is null)
  or created_by = (select auth.uid())
  or (organizer_structure_id is not null and public.is_structure_admin(organizer_structure_id))
);
create policy tournaments_insert_self on public.tournaments
for insert to authenticated with check (created_by = (select auth.uid()));
create policy tournaments_update_manager on public.tournaments
for update to authenticated using (public.is_tournament_manager(id))
with check (public.is_tournament_manager(id));
create policy tournaments_delete_manager on public.tournaments
for delete to authenticated using (public.is_tournament_manager(id));

create policy registrations_select_public_or_related on public.tournament_registrations
for select using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.is_public)
  or registered_by = (select auth.uid())
  or public.is_tournament_manager(tournament_id)
  or public.is_team_manager(team_id)
);
create policy registrations_insert_team_manager on public.tournament_registrations
for insert to authenticated with check (
  registered_by = (select auth.uid()) and public.is_team_manager(team_id)
);
create policy registrations_update_manager_or_team on public.tournament_registrations
for update to authenticated using (
  public.is_tournament_manager(tournament_id) or public.is_team_manager(team_id)
) with check (
  public.is_tournament_manager(tournament_id) or public.is_team_manager(team_id)
);
create policy registrations_delete_manager_or_team on public.tournament_registrations
for delete to authenticated using (
  public.is_tournament_manager(tournament_id) or public.is_team_manager(team_id)
);

-- Les phases et données compétitives sont publiques si le tournoi l'est,
-- administrables uniquement par l'organisateur. Les RPC serveur gèrent l'avancement.
create policy stages_select_public_or_manager on public.tournament_stages
for select using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.is_public)
  or public.is_tournament_manager(tournament_id)
);
create policy stages_manage_manager on public.tournament_stages
for all to authenticated using (public.is_tournament_manager(tournament_id))
with check (public.is_tournament_manager(tournament_id));

create policy groups_select_public_or_manager on public.stage_groups
for select using (
  exists (select 1 from public.tournament_stages s join public.tournaments t on t.id = s.tournament_id
          where s.id = stage_id and t.is_public)
  or exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
);
create policy groups_manage_manager on public.stage_groups
for all to authenticated using (
  exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
) with check (
  exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
);

create policy entries_select_public_or_manager on public.stage_entries
for select using (
  exists (select 1 from public.tournament_stages s join public.tournaments t on t.id = s.tournament_id
          where s.id = stage_id and t.is_public)
  or exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
);
create policy entries_manage_manager on public.stage_entries
for all to authenticated using (
  exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
) with check (
  exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
);

create policy transitions_select_public_or_manager on public.stage_transitions
for select using (
  exists (select 1 from public.tournament_stages s join public.tournaments t on t.id = s.tournament_id
          where s.id = from_stage_id and t.is_public)
  or exists (select 1 from public.tournament_stages s where s.id = from_stage_id and public.is_tournament_manager(s.tournament_id))
);
create policy transitions_manage_manager on public.stage_transitions
for all to authenticated using (
  exists (select 1 from public.tournament_stages s where s.id = from_stage_id and public.is_tournament_manager(s.tournament_id))
) with check (
  exists (select 1 from public.tournament_stages s where s.id = from_stage_id and public.is_tournament_manager(s.tournament_id))
);

create policy matches_select_public_or_manager on public.matches
for select using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.is_public)
  or public.is_tournament_manager(tournament_id)
);
create policy matches_manage_manager on public.matches
for all to authenticated using (public.is_tournament_manager(tournament_id))
with check (public.is_tournament_manager(tournament_id));

create policy slots_select_public_or_manager on public.match_slots
for select using (
  exists (select 1 from public.matches m join public.tournaments t on t.id = m.tournament_id
          where m.id = match_id and t.is_public)
  or exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_manager(m.tournament_id))
);
create policy slots_manage_manager on public.match_slots
for all to authenticated using (
  exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_manager(m.tournament_id))
) with check (
  exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_manager(m.tournament_id))
);

create policy games_select_public_or_manager on public.match_games
for select using (
  exists (select 1 from public.matches m join public.tournaments t on t.id = m.tournament_id
          where m.id = match_id and t.is_public)
  or exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_manager(m.tournament_id))
);
create policy games_manage_manager on public.match_games
for all to authenticated using (
  exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_manager(m.tournament_id))
) with check (
  exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_manager(m.tournament_id))
);

create policy match_messages_select_participant on public.match_messages
for select to authenticated using (public.is_match_participant(match_id));
create policy match_messages_insert_participant on public.match_messages
for insert to authenticated with check (
  sender_id = (select auth.uid())
  and public.is_match_participant(match_id)
);

create policy standings_select_public_or_manager on public.stage_standings
for select using (
  exists (select 1 from public.tournament_stages s join public.tournaments t on t.id = s.tournament_id
          where s.id = stage_id and t.is_public)
  or exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
);
create policy standings_manage_manager on public.stage_standings
for all to authenticated using (
  exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
) with check (
  exists (select 1 from public.tournament_stages s where s.id = stage_id and public.is_tournament_manager(s.tournament_id))
);

-- Invitations : les tokens en clair ne sont jamais stockés, seulement leur hash.
create policy invitations_select_sender_or_recipient on public.invitations
for select to authenticated using (
  invited_by = (select auth.uid())
  or email = (select lower(u.email) from auth.users u where u.id = (select auth.uid()))
);
create policy invitations_insert_sender on public.invitations
for insert to authenticated with check (invited_by = (select auth.uid()));
create policy invitations_update_sender_or_recipient on public.invitations
for update to authenticated using (
  invited_by = (select auth.uid())
  or email = (select lower(u.email) from auth.users u where u.id = (select auth.uid()))
) with check (
  invited_by = (select auth.uid())
  or email = (select lower(u.email) from auth.users u where u.id = (select auth.uid()))
);
create policy invitations_delete_sender on public.invitations
for delete to authenticated using (invited_by = (select auth.uid()));

-- Studio : le projet et ses scènes sont modifiables par l'organisateur du tournoi.
create policy studio_projects_select_public_or_manager on public.studio_projects
for select using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.is_public)
  or public.is_tournament_manager(tournament_id)
);
create policy studio_projects_manage_manager on public.studio_projects
for all to authenticated using (public.is_tournament_manager(tournament_id))
with check (public.is_tournament_manager(tournament_id));

create policy studio_scenes_select_public_or_manager on public.studio_scenes
for select using (
  exists (
    select 1 from public.studio_projects p join public.tournaments t on t.id = p.tournament_id
    where p.id = project_id and t.is_public
  )
  or exists (select 1 from public.studio_projects p where p.id = project_id and public.is_tournament_manager(p.tournament_id))
);
create policy studio_scenes_manage_manager on public.studio_scenes
for all to authenticated using (
  exists (select 1 from public.studio_projects p where p.id = project_id and public.is_tournament_manager(p.tournament_id))
) with check (
  exists (select 1 from public.studio_projects p where p.id = project_id and public.is_tournament_manager(p.tournament_id))
);

-- Les tokens sont secrets : aucune lecture directe côté client, même pour l'organisateur.
-- Gestion via fonction serveur/RPC ou service role uniquement.
create policy studio_tokens_no_direct_access on public.studio_public_tokens
for all to authenticated using (false) with check (false);

-- Les journaux sont en lecture serveur uniquement ; pas de politique client.
-- Le service role peut écrire/lire en contournant RLS.

commit;

-- ============================================================================
-- NOTES DE CONCEPTION / PROCHAINES ÉTAPES
-- ============================================================================
-- A. Création de profil : créer un trigger sur auth.users (ou le faire dans le
--    callback d'inscription) pour insérer public.profiles.
-- B. À l'inscription, vérifier côté serveur : statut du tournoi, dates, capacité,
--    compatibilité game/platform, droit du capitaine et absence de doublon.
-- C. Un moteur de tournoi doit générer stages/groups/entries/matches/match_slots,
--    calculer les classements et appliquer stage_transitions dans une transaction.
-- D. Après validation d'un score, propager le gagnant/perdant dans les slots liés
--    (source_match_id/source_outcome), recalculer standings et qualifier la phase suivante.
-- E. Les politiques RLS ne remplacent pas les validations métier : empêcher notamment
--    la modification d'un match terminé, les cycles de phases et les doubles résultats.
-- F. Pour une base existante, créer une migration séparée : mapping users -> profiles,
--    structures_users -> structure_members, teams_users -> team_members, puis migration
--    des anciens matchs alpha/beta vers match_slots.
-- ============================================================================
