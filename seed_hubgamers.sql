BEGIN;

-- ============================================================================
-- 1. IDENTIFIANTS FIXES ET CONSTANTES
-- ============================================================================
DO $$
DECLARE
  -- Utilisateurs
  v_admin_id UUID := '11111111-1111-4111-a111-111111111111';
  v_player1_id UUID := '11111111-1111-4111-a111-111111111112';
  v_player2_id UUID := '11111111-1111-4111-a111-111111111113';

  -- Structure & Tournoi
  v_structure_id UUID := '22222222-2222-4222-a222-222222222222';
  v_tournament_id UUID := '33333333-3333-4333-a333-333333333333';
  
  -- Stages
  v_stage_groups_id UUID := '44444444-4444-4444-a444-444444444444';
  v_stage_main_id UUID := '55555555-5555-4555-a555-555555555555';
  v_stage_consolation_id UUID := '66666666-6666-4666-a666-666666666666';

  -- Studio & Scène
  v_studio_project_id UUID := '77777777-7777-4777-a777-777777777777';
  v_studio_scene_id UUID := '88888888-8888-4888-a888-888888888888';

  -- Variables de boucles
  v_team_id UUID;
  v_reg_id UUID;
  v_group_id UUID;
  v_match_id UUID;
  v_team_counter INT := 1;
  v_group_letter CHAR(1);
  v_group_idx INT;
  v_team_in_group INT;
  
  v_team_ids UUID[] := '{}';
  v_reg_ids UUID[] := '{}';
  v_group_ids UUID[] := '{}';
  v_main_round1_matches UUID[] := '{}';

BEGIN

  -- ============================================================================
  -- 2. UTILISATEURS & PROFILS (Auth & Public)
  -- ============================================================================
  INSERT INTO "auth"."users" (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_sso_user)
  VALUES 
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@esports.com', '$2a$10$UnusedHashForSeedOnlyValue1234567890123', NOW(), '{"provider":"email","providers":["email"]}', '{"display_name":"Tournament Admin"}', false),
    (v_player1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'player1@esports.com', '$2a$10$UnusedHashForSeedOnlyValue1234567890123', NOW(), '{"provider":"email","providers":["email"]}', '{"display_name":"Alpha Captain"}', false),
    (v_player2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'player2@esports.com', '$2a$10$UnusedHashForSeedOnlyValue1234567890123', NOW(), '{"provider":"email","providers":["email"]}', '{"display_name":"Alpha Player"}', false)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO "public"."profiles" (id, username, display_name, avatar_url, bio)
  VALUES 
    (v_admin_id, 'admin_esports', 'Tournament Administrator', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'Organisateur officiel de tournois esport.'),
    (v_player1_id, 'alpha_captain', 'Alpha Captain', 'https://api.dicebear.com/7.x/bottts/svg?seed=p1', 'Capitaine de la Team Alpha 01.'),
    (v_player2_id, 'alpha_player', 'Alpha Player', 'https://api.dicebear.com/7.x/bottts/svg?seed=p2', 'Joueur flex de la Team Alpha 01.')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 3. STRUCTURES & MEMBRES
  -- ============================================================================
  INSERT INTO "public"."structures" (id, name, slug, description, website_url, created_by, is_public)
  VALUES (v_structure_id, 'Apex Esports League', 'apex-esports-league', 'Ligue officielle d esports organisant des tournois internationaux.', 'https://apex-esports.example.com', v_admin_id, true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO "public"."structure_members" (structure_id, user_id, role)
  VALUES 
    (v_structure_id, v_admin_id, 'OWNER'),
    (v_structure_id, v_player1_id, 'ADMIN')
  ON CONFLICT (structure_id, user_id) DO NOTHING;

  -- ============================================================================
  -- 4. TOURNOI (32 ÉQUIPES)
  -- ============================================================================
  INSERT INTO "public"."tournaments" (
    id, name, slug, description, rules, game, platform, status, organizer_structure_id, created_by, min_teams, max_teams, team_size_min, team_size_max, starts_at, timezone, is_public, is_free, prize_pool, prize_currency
  ) VALUES (
    v_tournament_id,
    'Championship Cup 2026',
    'championship-cup-2026',
    'Tournoi majeur à 32 équipes comprenant une phase de groupes suivie de deux arbres à élimination directe.',
    'Règlement standard. Fair-play obligatoire.',
    'Valorant',
    'PC',
    'IN_PROGRESS',
    v_structure_id,
    v_admin_id,
    32,
    32,
    5,
    5,
    NOW() + INTERVAL '1 day',
    'Europe/Paris',
    true,
    true,
    10000.00,
    'EUR'
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 5. ÉQUIPES, MEMBRES & INSCRIPTIONS
  -- ============================================================================
  FOR v_team_counter IN 1..32 LOOP
    v_team_id := gen_random_uuid();
    v_reg_id := gen_random_uuid();
    
    v_team_ids := array_append(v_team_ids, v_team_id);
    v_reg_ids := array_append(v_reg_ids, v_reg_id);

    INSERT INTO "public"."teams" (id, name, slug, game, platform, created_by, is_public)
    VALUES (
      v_team_id,
      'Team Alpha ' || LPAD(v_team_counter::text, 2, '0'),
      'team-alpha-' || LPAD(v_team_counter::text, 2, '0'),
      'Valorant',
      'PC',
      v_admin_id,
      true
    );

    -- Lier la première équipe aux utilisateurs de test
    IF v_team_counter = 1 THEN
      INSERT INTO "public"."team_members" (team_id, user_id, role, jersey_number)
      VALUES 
        (v_team_id, v_player1_id, 'CAPTAIN', 7),
        (v_team_id, v_player2_id, 'PLAYER', 10);
    ELSE
      INSERT INTO "public"."team_members" (team_id, user_id, role, jersey_number)
      VALUES (v_team_id, v_admin_id, 'MANAGER', 1);
    END IF;

    -- Lier l'équipe à la structure pour la team 1
    IF v_team_counter = 1 THEN
      INSERT INTO "public"."structure_teams" (structure_id, team_id)
      VALUES (v_structure_id, v_team_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Inscription validée
    INSERT INTO "public"."tournament_registrations" (id, tournament_id, team_id, registered_by, status, seed, checked_in_at)
    VALUES (
      v_reg_id,
      v_tournament_id,
      v_team_id,
      v_admin_id,
      'APPROVED',
      v_team_counter,
      NOW()
    );
  END LOOP;

  -- ============================================================================
  -- 6. STAGE 1 : PHASE DE GROUPES (8 GROUPES DE 4)
  -- ============================================================================
  INSERT INTO "public"."tournament_stages" (id, tournament_id, name, stage_order, stage_type, status)
  VALUES (v_stage_groups_id, v_tournament_id, 'Phase de Groupes', 1, 'GROUPS', 'IN_PROGRESS')
  ON CONFLICT DO NOTHING;

  FOR v_group_idx IN 1..8 LOOP
    v_group_letter := CHR(64 + v_group_idx);
    v_group_id := gen_random_uuid();
    v_group_ids := array_append(v_group_ids, v_group_id);

    INSERT INTO "public"."stage_groups" (id, stage_id, name, group_order)
    VALUES (v_group_id, v_stage_groups_id, 'Groupe ' || v_group_letter, v_group_idx);

    FOR v_team_in_group IN 1..4 LOOP
      v_reg_id := v_reg_ids[(v_group_idx - 1) * 4 + v_team_in_group];

      INSERT INTO "public"."stage_entries" (stage_id, registration_id, group_id, seed)
      VALUES (v_stage_groups_id, v_reg_id, v_group_id, v_team_in_group);

      INSERT INTO "public"."stage_standings" (stage_id, group_id, registration_id, rank, points, played, wins, losses)
      VALUES (v_stage_groups_id, v_group_id, v_reg_id, v_team_in_group, 3, 1, 1, 0);
    END LOOP;
  END LOOP;

  -- ============================================================================
  -- 7. STAGE 2 : BRACKET PRINCIPAL (16 ÉQUIPES) & EXEMPLE DE MATCH/GAME
  -- ============================================================================
  INSERT INTO "public"."tournament_stages" (id, tournament_id, name, stage_order, stage_type, status)
  VALUES (v_stage_main_id, v_tournament_id, 'Bracket Principal', 2, 'SINGLE_ELIMINATION', 'DRAFT')
  ON CONFLICT DO NOTHING;

  INSERT INTO "public"."stage_transitions" (from_stage_id, to_stage_id, name, source_scope, qualification_rule)
  VALUES (v_stage_groups_id, v_stage_main_id, 'Qualification Top 2', 'GROUP', '{"ranks": [1, 2], "target": "MAIN_BRACKET"}');

  -- Création d'un match de test en Huitième de finale avec des sous-parties (match_games)
  v_match_id := gen_random_uuid();
  v_main_round1_matches := array_append(v_main_round1_matches, v_match_id);

  INSERT INTO "public"."matches" (id, tournament_id, stage_id, name, round_number, match_order, status, best_of, winner_registration_id)
  VALUES (v_match_id, v_tournament_id, v_stage_main_id, 'Huitième de finale 1', 1, 1, 'COMPLETED', 3, v_reg_ids[1]);

  -- Slots pour ce match
  INSERT INTO "public"."match_slots" (match_id, side, registration_id, source, source_stage_id, source_group_id, source_rank)
  VALUES 
    (v_match_id, 'A', v_reg_ids[1], 'GROUP_RANK', v_stage_groups_id, v_group_ids[1], 1),
    (v_match_id, 'B', v_reg_ids[2], 'GROUP_RANK', v_stage_groups_id, v_group_ids[2], 2);

  -- Jeux / Maps individuelles du match
  INSERT INTO "public"."match_games" (match_id, game_number, score_a, score_b, winner_side, map_name, started_at, completed_at)
  VALUES 
    (v_match_id, 1, 13, 8, 'A', 'Ascent', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes'),
    (v_match_id, 2, 13, 11, 'A', 'Bind', NOW() - INTERVAL '1 hour 20 minutes', NOW() - INTERVAL '30 minutes');

  -- ============================================================================
  -- 8. STAGE 3 : BRACKET DE CONSOLATION (16 ÉQUIPES)
  -- ============================================================================
  INSERT INTO "public"."tournament_stages" (id, tournament_id, name, stage_order, stage_type, status)
  VALUES (v_stage_consolation_id, v_tournament_id, 'Bracket de Consolation', 3, 'SINGLE_ELIMINATION', 'DRAFT')
  ON CONFLICT DO NOTHING;

  INSERT INTO "public"."stage_transitions" (from_stage_id, to_stage_id, name, source_scope, qualification_rule)
  VALUES (v_stage_groups_id, v_stage_consolation_id, 'Qualification Rangs 3 et 4', 'GROUP', '{"ranks": [3, 4], "target": "CONSOLATION_BRACKET"}');

  -- ============================================================================
  -- 9. MODULE STUDIO & OVERLAYS (Scenes, Tokens, Audit Logs, Invitations)
  -- ============================================================================
  INSERT INTO "public"."studio_projects" (id, tournament_id, name, theme, created_by)
  VALUES (v_studio_project_id, v_tournament_id, 'Studio Production Principal', '{"primary": "#CCFF00", "secondary": "#1E293B", "background": "#0F172A"}', v_admin_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO "public"."studio_scenes" (id, project_id, name, scene_type, slug, is_enabled, is_default)
  VALUES (v_studio_scene_id, v_studio_project_id, 'Overlay Match en Direct', 'MATCH', 'live-match', true, true)
  ON CONFLICT DO NOTHING;

  INSERT INTO "public"."studio_public_tokens" (project_id, scene_id, token_hash, label, is_active)
  VALUES (v_studio_project_id, v_studio_scene_id, 'hash_sample_token_obs_123456789', 'OBS Browser Source Token', true)
  ON CONFLICT DO NOTHING;

  -- Journal d'audit
  INSERT INTO "public"."audit_logs" (actor_id, entity_type, entity_id, action, details)
  VALUES (v_admin_id, 'TOURNAMENT', v_tournament_id, 'CREATE', '{"message": "Création initiale du tournoi 32 équipes avec seed."}');

  -- Invitation de test
  INSERT INTO "public"."invitations" (email, target_type, target_id, invited_by, role, token_hash, status)
  VALUES ('invite.guest@esports.com', 'TOURNAMENT', v_tournament_id, v_admin_id, 'PLAYER', 'hash_invitation_token_sample_abc', 'PENDING')
  ON CONFLICT DO NOTHING;

END $$;

COMMIT;