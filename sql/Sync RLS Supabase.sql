-- ============================================================================
-- HUBGAMERS MVP - SUPABASE ROW LEVEL SECURITY (RLS) POLICIES (UUID VERSION)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS FOR AUTHENTICATED USERS
-- ----------------------------------------------------------------------------

-- Retrieves the internal UUID users.id matching the current Supabase Auth UUID (auth.uid())
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.users 
  WHERE id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1;
$$;

-- Helper: Check if current user is an Admin of a given Club
CREATE OR REPLACE FUNCTION public.is_club_admin(p_club_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clubs_members 
    WHERE club_id = p_club_id 
      AND user_id = public.current_user_id() 
      AND role_code = 'ADMIN'
  );
$$;

-- Helper: Check if current user is Captain of a given Roster
CREATE OR REPLACE FUNCTION public.is_roster_captain(p_roster_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rosters_members 
    WHERE roster_id = p_roster_id 
      AND user_id = public.current_user_id() 
      AND role_code = 'CAPTAIN'
  );
$$;

-- Helper: Check if current user is Owner of a given Squad
CREATE OR REPLACE FUNCTION public.is_squad_owner(p_squad_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.squads_members 
    WHERE squad_id = p_squad_id 
      AND user_id = public.current_user_id() 
      AND role_code = 'OWNER'
  );
$$;

-- Helper: Check if current user is Owner/Admin of a given Tournament
CREATE OR REPLACE FUNCTION public.is_tournament_admin(p_tournament_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tournaments_members 
    WHERE tournament_id = p_tournament_id 
      AND user_id = public.current_user_id() 
      AND role_code IN ('OWNER', 'ADMIN')
  );
$$;

-- Helper: Check if current user is assigned Arbiter for a Match
CREATE OR REPLACE FUNCTION public.is_match_arbiter(p_match_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.match_arbiters 
    WHERE match_id = p_match_id 
      AND user_id = public.current_user_id()
  );
$$;

-- Helper: Check if current user is Owner of a Studio
CREATE OR REPLACE FUNCTION public.is_studio_owner(p_studio_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.studios 
    WHERE id = p_studio_id 
      AND owner_user_id = public.current_user_id()
  );
$$;


-- ----------------------------------------------------------------------------
-- 2. ENABLE RLS ON ALL TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_accounts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.club_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosters_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.squad_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tournament_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_stage_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_stage_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bo_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registration_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_media_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veto_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overlay_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_target_types ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments_registrations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tournaments_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments_match_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_map_vetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_arbiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_disputes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tournament_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_scenes_config ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------------------
-- 3. LOOKUP / REFERENCE TABLES POLICIES (Read-Only Public Access)
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow public read on club_roles" ON public.club_roles FOR SELECT USING (true);
CREATE POLICY "Allow public read on team_roles" ON public.team_roles FOR SELECT USING (true);
CREATE POLICY "Allow public read on squad_types" ON public.squad_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on squad_member_roles" ON public.squad_member_roles FOR SELECT USING (true);
CREATE POLICY "Allow public read on tournament_statuses" ON public.tournament_statuses FOR SELECT USING (true);
CREATE POLICY "Allow public read on tournament_member_roles" ON public.tournament_member_roles FOR SELECT USING (true);
CREATE POLICY "Allow public read on tournament_stage_types" ON public.tournament_stage_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on tournament_stage_statuses" ON public.tournament_stage_statuses FOR SELECT USING (true);
CREATE POLICY "Allow public read on bo_options" ON public.bo_options FOR SELECT USING (true);
CREATE POLICY "Allow public read on tournament_registration_statuses" ON public.tournament_registration_statuses FOR SELECT USING (true);
CREATE POLICY "Allow public read on match_statuses" ON public.match_statuses FOR SELECT USING (true);
CREATE POLICY "Allow public read on match_media_types" ON public.match_media_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on veto_actions" ON public.veto_actions FOR SELECT USING (true);
CREATE POLICY "Allow public read on dispute_statuses" ON public.dispute_statuses FOR SELECT USING (true);
CREATE POLICY "Allow public read on overlay_types" ON public.overlay_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on invitation_target_types" ON public.invitation_target_types FOR SELECT USING (true);


-- ----------------------------------------------------------------------------
-- 4. USERS & GAME ACCOUNTS POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can search/view user profiles
CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);

-- User can update their own profile
CREATE POLICY "Allow individual update on users" ON public.users FOR UPDATE 
USING (id = public.current_user_id());

-- Game accounts viewable by all
CREATE POLICY "Allow public read on user_game_accounts" ON public.user_game_accounts FOR SELECT USING (true);

-- User manages their own game accounts
CREATE POLICY "Allow individual insert on user_game_accounts" ON public.user_game_accounts FOR INSERT 
WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "Allow individual update on user_game_accounts" ON public.user_game_accounts FOR UPDATE 
USING (user_id = public.current_user_id());

CREATE POLICY "Allow individual delete on user_game_accounts" ON public.user_game_accounts FOR DELETE 
USING (user_id = public.current_user_id());


-- ----------------------------------------------------------------------------
-- 5. CLUBS & CLUBS MEMBERS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow public read on clubs" ON public.clubs FOR SELECT USING (true);

CREATE POLICY "Allow auth users to create clubs" ON public.clubs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow club admin to update clubs" ON public.clubs FOR UPDATE 
USING (public.is_club_admin(id));

CREATE POLICY "Allow public read on clubs_members" ON public.clubs_members FOR SELECT USING (true);

CREATE POLICY "Allow club admin to manage members" ON public.clubs_members FOR ALL 
USING (public.is_club_admin(club_id));

CREATE POLICY "Allow member to leave club" ON public.clubs_members FOR DELETE 
USING (user_id = public.current_user_id());


-- ----------------------------------------------------------------------------
-- 6. ROSTERS & TEAMS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow public read on rosters" ON public.rosters FOR SELECT USING (true);

CREATE POLICY "Allow auth users to create rosters" ON public.rosters FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow roster captain to update rosters" ON public.rosters FOR UPDATE 
USING (public.is_roster_captain(id));

CREATE POLICY "Allow public read on rosters_members" ON public.rosters_members FOR SELECT USING (true);

CREATE POLICY "Allow roster captain to manage members" ON public.rosters_members FOR ALL 
USING (public.is_roster_captain(roster_id));

CREATE POLICY "Allow member to leave roster" ON public.rosters_members FOR DELETE 
USING (user_id = public.current_user_id());


-- ----------------------------------------------------------------------------
-- 7. SQUADS (LFG) POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow public read on squads" ON public.squads FOR SELECT USING (true);

CREATE POLICY "Allow auth users to create squads" ON public.squads FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow squad owner to update squad" ON public.squads FOR UPDATE 
USING (public.is_squad_owner(id));

CREATE POLICY "Allow squad owner to delete squad" ON public.squads FOR DELETE 
USING (public.is_squad_owner(id));

CREATE POLICY "Allow public read on squads_members" ON public.squads_members FOR SELECT USING (true);

CREATE POLICY "Allow squad members to join/leave" ON public.squads_members FOR INSERT 
WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "Allow squad members or owner to remove" ON public.squads_members FOR DELETE 
USING (user_id = public.current_user_id() OR public.is_squad_owner(squad_id));


-- ----------------------------------------------------------------------------
-- 8. TOURNAMENTS & REGISTRATIONS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow public read on tournaments" ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "Allow auth users to create tournaments" ON public.tournaments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow tournament admin to update tournament" ON public.tournaments FOR UPDATE 
USING (public.is_tournament_admin(id));

CREATE POLICY "Allow public read on tournament_prizes" ON public.tournament_prizes FOR SELECT USING (true);
CREATE POLICY "Allow tournament admin to manage prizes" ON public.tournament_prizes FOR ALL 
USING (public.is_tournament_admin(tournament_id));

CREATE POLICY "Allow public read on sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Allow public read on tournament_sponsors" ON public.tournament_sponsors FOR SELECT USING (true);
CREATE POLICY "Allow tournament admin to manage tournament_sponsors" ON public.tournament_sponsors FOR ALL 
USING (public.is_tournament_admin(tournament_id));

CREATE POLICY "Allow public read on tournaments_members" ON public.tournaments_members FOR SELECT USING (true);
CREATE POLICY "Allow tournament admin to manage staff" ON public.tournaments_members FOR ALL 
USING (public.is_tournament_admin(tournament_id));

CREATE POLICY "Allow public read on tournaments_stages" ON public.tournaments_stages FOR SELECT USING (true);
CREATE POLICY "Allow tournament admin to manage stages" ON public.tournaments_stages FOR ALL 
USING (public.is_tournament_admin(tournament_id));

CREATE POLICY "Allow public read on tournaments_registrations" ON public.tournaments_registrations FOR SELECT USING (true);

CREATE POLICY "Allow roster captains to register" ON public.tournaments_registrations FOR INSERT 
WITH CHECK (public.is_roster_captain(roster_id));

CREATE POLICY "Allow roster captain or tournament admin to update registration" ON public.tournaments_registrations FOR UPDATE 
USING (public.is_roster_captain(roster_id) OR public.is_tournament_admin(tournament_id));


-- ----------------------------------------------------------------------------
-- 9. MATCHES, MEDIA & VETOS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow public read on tournaments_matches" ON public.tournaments_matches FOR SELECT USING (true);

CREATE POLICY "Allow tournament admin to manage matches" ON public.tournaments_matches FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments_stages ts
    WHERE ts.id = stage_id AND public.is_tournament_admin(ts.tournament_id)
  )
);

CREATE POLICY "Allow public read on tournaments_match_games" ON public.tournaments_match_games FOR SELECT USING (true);

CREATE POLICY "Allow public read on match_media" ON public.match_media FOR SELECT USING (true);

CREATE POLICY "Allow users to upload match_media" ON public.match_media FOR INSERT 
WITH CHECK (uploaded_by_user_id = public.current_user_id());

CREATE POLICY "Allow public read on match_map_vetos" ON public.match_map_vetos FOR SELECT USING (true);

CREATE POLICY "Allow team captains to participate in map vetos" ON public.match_map_vetos FOR INSERT 
WITH CHECK (public.is_roster_captain(roster_id));

CREATE POLICY "Allow public read on match_arbiters" ON public.match_arbiters FOR SELECT USING (true);

CREATE POLICY "Allow public read on match_disputes" ON public.match_disputes FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to open disputes" ON public.match_disputes FOR INSERT 
WITH CHECK (opened_by_user_id = public.current_user_id());

CREATE POLICY "Allow arbiters or admins to update disputes" ON public.match_disputes FOR UPDATE 
USING (public.is_match_arbiter(match_id));


-- ----------------------------------------------------------------------------
-- 10. STREAMS, STUDIOS & OVERLAYS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow public read on tournament_streams" ON public.tournament_streams FOR SELECT USING (true);

CREATE POLICY "Allow stream management" ON public.tournament_streams FOR ALL 
USING (public.is_tournament_admin(tournament_id));

CREATE POLICY "Allow public read on studios" ON public.studios FOR SELECT USING (true);

CREATE POLICY "Allow users to create studios" ON public.studios FOR INSERT 
WITH CHECK (owner_user_id = public.current_user_id());

CREATE POLICY "Allow studio owners to update/delete studio" ON public.studios FOR ALL 
USING (owner_user_id = public.current_user_id());

-- OBS Overlay source browser read access via valid access_token (Public token read)
CREATE POLICY "Allow public read on studio_overlays" ON public.studio_overlays FOR SELECT USING (true);

CREATE POLICY "Allow studio owners to manage overlays" ON public.studio_overlays FOR ALL 
USING (public.is_studio_owner(studio_id));

CREATE POLICY "Allow public read on studio_scenes_config" ON public.studio_scenes_config FOR SELECT USING (true);

CREATE POLICY "Allow studio owners to update scene config" ON public.studio_scenes_config FOR ALL 
USING (public.is_studio_owner(studio_id));


-- ----------------------------------------------------------------------------
-- 11. INVITATIONS & NOTIFICATIONS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Allow inviter to view invitation" ON public.invitations FOR SELECT 
USING (inviter_id = public.current_user_id() OR auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create invitations" ON public.invitations FOR INSERT 
WITH CHECK (inviter_id = public.current_user_id());

-- Users can only read & update their own notifications
CREATE POLICY "Allow user to read own notifications" ON public.notifications FOR SELECT 
USING (user_id = public.current_user_id());

CREATE POLICY "Allow user to update own notifications" ON public.notifications FOR UPDATE 
USING (user_id = public.current_user_id());