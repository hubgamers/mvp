-- ============================================================================
-- HUBGAMERS MVP - SUPABASE TRIGGERS & TRIGGER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUTOMATIC UPDATED_AT TIMESTAMP
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply set_updated_at trigger to relevant tables
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_user_game_accounts_updated_at BEFORE UPDATE ON public.user_game_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_clubs_updated_at BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_clubs_members_updated_at BEFORE UPDATE ON public.clubs_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_rosters_updated_at BEFORE UPDATE ON public.rosters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_rosters_members_updated_at BEFORE UPDATE ON public.rosters_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_squads_updated_at BEFORE UPDATE ON public.squads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tournaments_updated_at BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tournaments_stages_updated_at BEFORE UPDATE ON public.tournaments_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tournaments_registrations_updated_at BEFORE UPDATE ON public.tournaments_registrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tournaments_matches_updated_at BEFORE UPDATE ON public.tournaments_matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tournaments_match_games_updated_at BEFORE UPDATE ON public.tournaments_match_games FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_match_disputes_updated_at BEFORE UPDATE ON public.match_disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tournament_streams_updated_at BEFORE UPDATE ON public.tournament_streams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_studios_updated_at BEFORE UPDATE ON public.studios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_studio_overlays_updated_at BEFORE UPDATE ON public.studio_overlays FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_studio_scenes_config_updated_at BEFORE UPDATE ON public.studio_scenes_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 2. SUPABASE AUTH USER SYNC TO PUBLIC.USERS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (email, display_name, created_at, updated_at)
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger listening to Supabase internal auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 3. AUTO-ASSIGN OWNER / ADMIN ROLES ON ENTITY CREATION
-- ----------------------------------------------------------------------------

-- Automatically add Creator as ADMIN of a Club
CREATE OR REPLACE FUNCTION public.handle_club_created()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id int;
BEGIN
  v_user_id := public.current_user_id();
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.clubs_members (user_id, club_id, role_code, created_at, updated_at)
    VALUES (v_user_id, NEW.id, 'ADMIN', NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_on_club_created
  AFTER INSERT ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.handle_club_created();


-- Automatically add Creator as CAPTAIN of a Roster
CREATE OR REPLACE FUNCTION public.handle_roster_created()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id int;
BEGIN
  v_user_id := public.current_user_id();
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.rosters_members (user_id, roster_id, role_code, created_at, updated_at)
    VALUES (v_user_id, NEW.id, 'CAPTAIN', NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_on_roster_created
  AFTER INSERT ON public.rosters
  FOR EACH ROW EXECUTE FUNCTION public.handle_roster_created();


-- Automatically add Creator as OWNER of a Squad
CREATE OR REPLACE FUNCTION public.handle_squad_created()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id int;
BEGIN
  v_user_id := public.current_user_id();
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.squads_members (user_id, squad_id, role_code)
    VALUES (v_user_id, NEW.id, 'OWNER')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_on_squad_created
  AFTER INSERT ON public.squads
  FOR EACH ROW EXECUTE FUNCTION public.handle_squad_created();


-- Automatically add Creator as OWNER of a Tournament
CREATE OR REPLACE FUNCTION public.handle_tournament_created()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id int;
BEGIN
  v_user_id := public.current_user_id();
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.tournaments_members (user_id, tournament_id, role_code, created_at)
    VALUES (v_user_id, NEW.id, 'OWNER', NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_on_tournament_created
  AFTER INSERT ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.handle_tournament_created();


-- ----------------------------------------------------------------------------
-- 4. MATCH CHECK-IN & AUTOMATIC STATUS SWITCH
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_match_checkin_status()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  -- Switch status to 'READY' when both rosters checked in
  IF NEW.roster1_checked_in = true AND NEW.roster2_checked_in = true AND OLD.status_code = 'PENDING' THEN
    NEW.status_code = 'READY';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_match_checkin_status
  BEFORE UPDATE ON public.tournaments_matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_match_checkin_status();


-- ----------------------------------------------------------------------------
-- 5. MATCH GAME RESULT & WINNER CALCULATION
-- ----------------------------------------------------------------------------

-- Determines game map winner automatically based on scores
CREATE OR REPLACE FUNCTION public.calculate_game_winner()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_match RECORD;
BEGIN
  SELECT roster1_id, roster2_id INTO v_match 
  FROM public.tournaments_matches 
  WHERE id = NEW.match_id;

  IF NEW.roster1_score > NEW.roster2_score THEN
    NEW.winner_roster_id = v_match.roster1_id;
  ELSIF NEW.roster2_score > NEW.roster1_score THEN
    NEW.winner_roster_id = v_match.roster2_id;
  ELSE
    NEW.winner_roster_id = NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_calculate_game_winner
  BEFORE INSERT OR UPDATE ON public.tournaments_match_games
  FOR EACH ROW EXECUTE FUNCTION public.calculate_game_winner();


-- ----------------------------------------------------------------------------
-- 6. STUDIO AUTO-CONFIGURATION CREATION
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_studio_created()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Create default overlay scene configuration
  INSERT INTO public.studio_scenes_config (studio_id, primary_color, secondary_color, font_family, show_sponsors, show_casters, updated_at)
  VALUES (NEW.id, '#00F0FF', '#FF0055', 'Inter', true, true, NOW())
  ON CONFLICT DO NOTHING;

  -- Create default overlays
  INSERT INTO public.studio_overlays (studio_id, type_code, access_token, is_enabled, created_at, updated_at)
  VALUES 
    (NEW.id, 'SCOREBOARD', gen_random_uuid()::text, true, NOW(), NOW()),
    (NEW.id, 'MATCH_INFO', gen_random_uuid()::text, true, NOW(), NOW()),
    (NEW.id, 'VETO_PHASE', gen_random_uuid()::text, true, NOW(), NOW()),
    (NEW.id, 'BRACKET', gen_random_uuid()::text, true, NOW(), NOW());

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_on_studio_created
  AFTER INSERT ON public.studios
  FOR EACH ROW EXECUTE FUNCTION public.handle_studio_created();


-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS TRIGGERS (DISPUTES & REGISTRATIONS)
-- ----------------------------------------------------------------------------

-- Notify Tournament Admins and Arbiters when a Dispute is opened
CREATE OR REPLACE FUNCTION public.notify_on_dispute_opened()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_arbiter RECORD;
  v_tournament_id int;
BEGIN
  SELECT ts.tournament_id INTO v_tournament_id 
  FROM public.tournaments_matches tm
  JOIN public.tournaments_stages ts ON ts.id = tm.stage_id
  WHERE tm.id = NEW.match_id;

  -- Notify assigned arbiters
  FOR v_arbiter IN 
    SELECT user_id FROM public.match_arbiters WHERE match_id = NEW.match_id
    UNION
    SELECT user_id FROM public.tournaments_members WHERE tournament_id = v_tournament_id AND role_code IN ('OWNER', 'ADMIN', 'ARBITRE')
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, created_at)
    VALUES (
      v_arbiter.user_id,
      'Nouveau litige ouvert',
      'Un litige a été ouvert pour le match #' || NEW.match_id || '. Raison : ' || NEW.reason,
      'DISPUTE_OPENED',
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_notify_on_dispute_opened
  AFTER INSERT ON public.match_disputes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_dispute_opened();


-- Notify Roster Members when Registration is Accepted
CREATE OR REPLACE FUNCTION public.notify_on_registration_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_member RECORD;
  v_tournament_name varchar;
BEGIN
  IF NEW.status_code = 'ACCEPTED' AND (OLD.status_code IS NULL OR OLD.status_code != 'ACCEPTED') THEN
    SELECT name INTO v_tournament_name FROM public.tournaments WHERE id = NEW.tournament_id;

    FOR v_member IN SELECT user_id FROM public.rosters_members WHERE roster_id = NEW.roster_id LOOP
      INSERT INTO public.notifications (user_id, title, message, type, created_at)
      VALUES (
        v_member.user_id,
        'Inscription validée !',
        'Votre équipe a été acceptée dans le tournoi ' || v_tournament_name,
        'REGISTRATION_ACCEPTED',
        NOW()
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_notify_on_registration_accepted
  AFTER UPDATE ON public.tournaments_registrations
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_registration_accepted();