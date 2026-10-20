-- ============================================================================
-- HubGamers MVP+ — Script de Données Factices (Seed Data)
-- Compatible PostgreSQL / Supabase
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. UTILISATEURS FACTICES (Auth & Profiles)
-- Note : Sur Supabase, l'insertion directe dans auth.users est permise en local 
-- ou via le rôle service_role. Des UUID statiques sont utilisés pour les liaisons.
-- ---------------------------------------------------------------------------

-- Nettoyage optionnel ou insertion directe sécurisée par ON CONFLICT
insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@hubgamers.io', '{"username": "admin_hub"}', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'capitaine.bds@hubgamers.io', '{"username": "MelzH"}', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'manager.kc@hubgamers.io', '{"username": "KametoFan"}', now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'player1@hubgamers.io', '{"username": "RaiZen"}', now(), now()),
  ('55555555-5555-5555-5555-555555555555', 'player2@hubgamers.io', '{"username": "Shaiiko_fan"}', now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, username, display_name, bio, avatar_url)
values
  ('11111111-1111-1111-1111-111111111111', 'admin_hub', 'HubGamers Admin', 'Fondateur et administrateur principal de la plateforme HubGamers.', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'),
  ('22222222-2222-2222-2222-222222222222', 'MelzH', 'MelzH (Capitaine)', 'Capitaine de l''équipe professionnelle sur Rainbow Six Siege.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
  ('33333333-3333-3333-3333-333333333333', 'KametoFan', 'KCorp Manager', 'Manager général pour les tournois majeurs.', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'),
  ('44444444-4444-4444-4444-444444444444', 'RaiZen', 'RaiZen Player', 'Joueur flex / support.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'),
  ('55555555-5555-5555-5555-555555555555', 'Shaiiko_fan', 'Shaiiko Enjoyer', 'Rifler principal.', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150')
on conflict (id) do update set username = excluded.username;

-- ---------------------------------------------------------------------------
-- 2. STRUCTURES ESPORT & MEMBRES
-- ---------------------------------------------------------------------------

insert into public.structures (id, name, slug, description, website_url, created_by, is_public)
values
  ('aaaaaa01-0000-0000-0000-000000000001', 'HubGamers Official', 'hubgamers-official', 'Structure organisatrice officielle des tournois communautaires.', 'https://hubgamers.io', '11111111-1111-1111-1111-111111111111', true),
  ('aaaaaa02-0000-0000-0000-000000000002', 'Blue Stars Esport', 'blue-stars', 'Structure esport compétitive sur PC et Console.', 'https://bluestars.example.com', '22222222-2222-2222-2222-222222222222', true)
on conflict (id) do nothing;

insert into public.structure_members (structure_id, user_id, role)
values
  ('aaaaaa01-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'OWNER'),
  ('aaaaaa02-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'OWNER'),
  ('aaaaaa02-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'MEMBER')
on conflict (structure_id, user_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. ÉQUIPES & MEMBRES D'ÉQUIPES
-- ---------------------------------------------------------------------------

insert into public.teams (id, name, slug, game, platform, description, created_by, is_public)
values
  ('bbbbbb01-0000-0000-0000-000000000001', 'Blue Stars R6', 'blue-stars-r6', 'Rainbow Six Siege', 'PC', 'Équipe officielle Rainbow Six Siege.', '22222222-2222-2222-2222-222222222222', true),
  ('bbbbbb02-0000-0000-0000-000000000002', 'Apex Legends Titans', 'apex-titans', 'Apex Legends', 'PC', 'Roster compétitif Apex.', '33333333-3333-3333-3333-333333333333', true)
on conflict (id) do nothing;

insert into public.team_members (team_id, user_id, role, jersey_number)
values
  ('bbbbbb01-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'CAPTAIN', 7),
  ('bbbbbb01-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'PLAYER', 10),
  ('bbbbbb01-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'PLAYER', 99),
  ('bbbbbb02-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'MANAGER', null)
on conflict (team_id, user_id) do nothing;

-- Rattachement structure -> équipe
insert into public.structure_teams (structure_id, team_id)
values
  ('aaaaaa02-0000-0000-0000-000000000002', 'bbbbbb01-0000-0000-0000-000000000001')
on conflict (structure_id, team_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. TOURNOIS & INSCRIPTIONS
-- ---------------------------------------------------------------------------

insert into public.tournaments (
  id, name, slug, description, rules, game, platform, status, 
  organizer_structure_id, created_by, min_teams, max_teams, 
  team_size_min, team_size_max, prize_pool, prize_currency, is_public
)
values
  (
    'cccccccc-0000-0000-0000-000000000001',
    'HubGamers Cup #1 - Rainbow Six Siege',
    'hubgamers-cup-1-r6',
    'Premier tournoi officiel de la saison sur Rainbow Six Siege.',
    'Règlement standard ESL / Matchs en BO3.',
    'Rainbow Six Siege',
    'PC',
    'IN_PROGRESS',
    'aaaaaa01-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    2, 16, 3, 5, 500.00, 'EUR', true
  )
on conflict (id) do nothing;

insert into public.tournament_registrations (
  id, tournament_id, team_id, registered_by, status, seed, checked_in_at
)
values
  (
    'dddddd01-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    'bbbbbb01-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'CHECKED_IN',
    1,
    now()
  ),
  (
    'dddddd02-0000-0000-0000-000000000002',
    'cccccccc-0000-0000-0000-000000000001',
    'bbbbbb02-0000-0000-0000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'CHECKED_IN',
    2,
    now()
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. PHASES, GROUPES ET MATCHS
-- ---------------------------------------------------------------------------

insert into public.tournament_stages (
  id, tournament_id, name, stage_order, stage_type, status, config
)
values
  (
    'eeeeee01-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    'Playoffs - Bracket Principal',
    1,
    'SINGLE_ELIMINATION',
    'IN_PROGRESS',
    '{"best_of": 3, "third_place_match": false}'::jsonb
  )
on conflict (id) do nothing;

insert into public.matches (
  id, tournament_id, stage_id, name, round_number, match_order, status, best_of, started_at
)
values
  (
    'ffffff01-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    'eeeeee01-0000-0000-0000-000000000001',
    'Finale',
    1,
    1,
    'LIVE',
    3,
    now()
  )
on conflict (id) do nothing;

-- Slots du match (Équipe A vs Équipe B)
insert into public.match_slots (
  id, match_id, side, registration_id, source
)
values
  (
    '77777701-0000-0000-0000-000000000001',
    'ffffff01-0000-0000-0000-000000000001',
    'A',
    'dddddd01-0000-0000-0000-000000000001',
    'REGISTRATION'
  ),
  (
    '77777702-0000-0000-0000-000000000002',
    'ffffff01-0000-0000-0000-000000000001',
    'B',
    'dddddd02-0000-0000-0000-000000000002',
    'REGISTRATION'
  )
on conflict (id) do nothing;

-- Scores détaillés par carte (Map 1 en cours)
insert into public.match_games (
  id, match_id, game_number, score_a, score_b, map_name, started_at
)
values
  (
    '88888801-0000-0000-0000-000000000001',
    'ffffff01-0000-0000-0000-000000000001',
    1,
    5,
    3,
    'Clubhouse',
    now()
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 6. HUBGAMERS STUDIO (Overlays & Projets)
-- ---------------------------------------------------------------------------

insert into public.studio_projects (
  id, tournament_id, name, theme, created_by
)
values
  (
    '99999901-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    'Studio Principal - HubGamers Cup #1',
    '{"primary": "#CCFF00", "secondary": "#1E293B", "background": "#0F172A"}'::jsonb,
    '11111111-1111-1111-1111-111111111111'
  )
on conflict (id) do nothing;

insert into public.studio_scenes (
  id, project_id, name, scene_type, slug, is_enabled, is_default, layout
)
values
  (
    'aaaa0001-0000-0000-0000-000000000001',
    '99999901-0000-0000-0000-000000000001',
    'Match en cours (Overlay Scoreboard)',
    'MATCH',
    'live-match',
    true,
    true,
    '{"width": 1920, "height": 1080, "widgets": ["scoreboard", "cams", "timer"]}'::jsonb
  )
on conflict (id) do nothing;

commit;