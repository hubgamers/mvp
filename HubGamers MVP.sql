-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE "StructureMemberRole" AS ENUM ('ADMIN', 'USER');

CREATE TYPE "TeamMemberRole" AS ENUM ('MANAGER', 'CAPTAIN', 'PLAYER');

CREATE TYPE "Platform" AS ENUM ('PC', 'PLAYSTATION', 'XBOX');

CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'ONGOING', 'COMPLETED');

CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CHECKED_IN');

CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'LIVE', 'COMPLETED');

CREATE TYPE "InvitationType" AS ENUM ('STRUCTURE', 'TEAM', 'TOURNAMENT');

CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REFUSED', 'EXPIRED');

-- ==========================================
-- 2. TABLES
-- ==========================================
CREATE TABLE
    "users" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "email" varchar(255) UNIQUE NOT NULL,
        "avatar_url" text,
        "created_at" timestamptz DEFAULT (now ())
    );

CREATE TABLE
    "structures" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "name" varchar(255) NOT NULL,
        "created_by" uuid NOT NULL,
        "created_at" timestamptz DEFAULT (now ())
    );

CREATE TABLE
    "structures_users" (
        "structure_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "StructureMemberRole" DEFAULT 'USER',
        PRIMARY KEY ("structure_id", "user_id")
    );

CREATE TABLE
    "teams" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "name" varchar(255) NOT NULL,
        "game" varchar(255) NOT NULL,
        "platform" "Platform" DEFAULT 'PC',
        "created_by" uuid NOT NULL,
        "created_at" timestamptz DEFAULT (now ())
    );

CREATE TABLE
    "teams_users" (
        "team_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" varchar(50) DEFAULT 'PLAYER',
        "created_at" timestamptz DEFAULT (now()),
        PRIMARY KEY ("team_id", "user_id")
    );

CREATE TABLE
    "structures_teams" (
        "structure_id" uuid NOT NULL,
        "team_id" uuid NOT NULL,
        PRIMARY KEY ("structure_id", "team_id")
    );

CREATE TABLE
    "tournaments" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "name" varchar(255) NOT NULL,
        "game" varchar(255) NOT NULL,
        "platform" "Platform" DEFAULT 'PC',
        "status" "TournamentStatus" DEFAULT 'DRAFT',
        "created_by" uuid NOT NULL,
        "created_at" timestamptz DEFAULT (now ())
    );

CREATE TABLE
    "tournament_registrations" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "tournament_id" uuid NOT NULL,
        "team_id" uuid NOT NULL,
        "status" "RegistrationStatus" DEFAULT 'PENDING',
        "registered_at" timestamptz DEFAULT (now ())
    );

CREATE TABLE
    "matches" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "tournament_id" uuid NOT NULL,
        "alpha_team_id" uuid,
        "beta_team_id" uuid,
        "score_alpha" integer DEFAULT 0,
        "score_beta" integer DEFAULT 0,
        "winner_id" uuid,
        "round_number" integer NOT NULL,
        "match_order" integer NOT NULL,
        "status" "MatchStatus" DEFAULT 'PENDING',
        "created_at" timestamptz DEFAULT (now ())
    );

CREATE TABLE
    "overlay_settings" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "tournament_id" uuid UNIQUE NOT NULL,
        "primary_color" varchar(50) DEFAULT '#3B82F6',
        "secondary_color" varchar(50) DEFAULT '#1E293B',
        "show_logo" boolean DEFAULT true,
        "custom_logo_url" text,
        "created_at" timestamptz DEFAULT (now ())
    );

CREATE TABLE
    "invitations" (
        "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
        "email" varchar(255) NOT NULL,
        "type" "InvitationType" NOT NULL,
        "target_id" uuid NOT NULL,
        "invited_by" uuid NOT NULL,
        "role" varchar(50) DEFAULT 'PLAYER',
        "status" "InvitationStatus" DEFAULT 'PENDING',
        "created_at" timestamptz DEFAULT (now ())
    );

-- Index uniques et de recherche
CREATE UNIQUE INDEX ON "tournament_registrations" ("tournament_id", "team_id");
CREATE INDEX idx_invitations_email ON "invitations" ("email");

-- ==========================================
-- 3. FOREIGN KEYS
-- ==========================================
ALTER TABLE "structures" ADD CONSTRAINT "structures_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "structures_users" ADD FOREIGN KEY ("structure_id") REFERENCES "structures" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "structures_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "teams_users" ADD CONSTRAINT "teams_users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE;
ALTER TABLE "teams_users" ADD CONSTRAINT "teams_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "structures_teams" ADD FOREIGN KEY ("structure_id") REFERENCES "structures" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "structures_teams" ADD FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_registrations" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "tournament_registrations" ADD FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "matches" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "matches" ADD FOREIGN KEY ("alpha_team_id") REFERENCES "teams" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "matches" ADD FOREIGN KEY ("beta_team_id") REFERENCES "teams" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "matches" ADD FOREIGN KEY ("winner_id") REFERENCES "teams" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "overlay_settings" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users" ("id") ON DELETE CASCADE;

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- USERS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" ON "users" FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON "users" FOR INSERT TO authenticated WITH CHECK (auth.uid () = id);
CREATE POLICY "Users can update their own profile" ON "users" FOR UPDATE TO authenticated USING (auth.uid () = id);


-- STRUCTURES
ALTER TABLE "structures" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des structures pour les membres ou créateurs" ON "structures" FOR SELECT TO authenticated 
USING (created_by = auth.uid() OR id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid()));

CREATE POLICY "Création de structures pour les utilisateurs authentifiés" ON "structures" FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Modification des structures pour les admins" ON "structures" FOR UPDATE TO authenticated 
USING (id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Suppression des structures pour les admins" ON "structures" FOR DELETE TO authenticated 
USING (id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN'));


-- STRUCTURES_USERS
ALTER TABLE "structures_users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des membres de structure" ON "structures_users" FOR SELECT TO authenticated 
USING (structure_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid()));

CREATE POLICY "Gestion des membres de structure par les admins" ON "structures_users" FOR INSERT TO authenticated 
WITH CHECK (
  structure_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN')
  OR user_id = auth.uid()
);

CREATE POLICY "Mise à jour des membres de structure par les admins" ON "structures_users" FOR UPDATE TO authenticated 
USING (structure_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Suppression des membres de structure par les admins" ON "structures_users" FOR DELETE TO authenticated 
USING (
  structure_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN')
  OR user_id = auth.uid()
);


-- TEAMS
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des équipes" ON "teams" FOR SELECT TO authenticated 
USING (
  created_by = auth.uid()
  OR id IN (SELECT team_id FROM teams_users WHERE user_id = auth.uid())
  OR id IN (
    SELECT st.team_id FROM structures_teams st
    JOIN structures_users su ON st.structure_id = su.structure_id
    WHERE su.user_id = auth.uid()
  )
);

CREATE POLICY "Création d'équipes" ON "teams" FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Modification d'équipes par les capitaines ou admins structure" ON "teams" FOR UPDATE TO authenticated 
USING (
  id IN (SELECT team_id FROM teams_users WHERE user_id = auth.uid() AND role IN ('CAPTAIN', 'MANAGER'))
  OR id IN (
    SELECT st.team_id FROM structures_teams st
    JOIN structures_users su ON st.structure_id = su.structure_id
    WHERE su.user_id = auth.uid() AND su.role = 'ADMIN'
  )
);

CREATE POLICY "Suppression d'équipes" ON "teams" FOR DELETE TO authenticated 
USING (
  created_by = auth.uid()
  OR id IN (
    SELECT st.team_id FROM structures_teams st
    JOIN structures_users su ON st.structure_id = su.structure_id
    WHERE su.user_id = auth.uid() AND su.role = 'ADMIN'
  )
);


-- TEAMS_USERS
ALTER TABLE "teams_users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des membres d'équipe" ON "teams_users" FOR SELECT TO authenticated 
USING (
  team_id IN (SELECT team_id FROM teams_users WHERE user_id = auth.uid())
  OR team_id IN (
    SELECT st.team_id FROM structures_teams st
    JOIN structures_users su ON st.structure_id = su.structure_id
    WHERE su.user_id = auth.uid() AND su.role = 'ADMIN'
  )
);

CREATE POLICY "Gestion des membres d'équipe (insertion)" ON "teams_users" FOR INSERT TO authenticated 
WITH CHECK (
  team_id IN (SELECT team_id FROM teams_users WHERE user_id = auth.uid() AND role IN ('CAPTAIN', 'MANAGER'))
  OR team_id IN (
    SELECT st.team_id FROM structures_teams st
    JOIN structures_users su ON st.structure_id = su.structure_id
    WHERE su.user_id = auth.uid() AND su.role = 'ADMIN'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Mise à jour des membres d'équipe" ON "teams_users" FOR UPDATE TO authenticated 
USING (
  team_id IN (SELECT team_id FROM teams_users WHERE user_id = auth.uid() AND role IN ('CAPTAIN', 'MANAGER'))
  OR team_id IN (
    SELECT st.team_id FROM structures_teams st
    JOIN structures_users su ON st.structure_id = su.structure_id
    WHERE su.user_id = auth.uid() AND su.role = 'ADMIN'
  )
);

CREATE POLICY "Suppression des membres d'équipe" ON "teams_users" FOR DELETE TO authenticated 
USING (
  team_id IN (SELECT team_id FROM teams_users WHERE user_id = auth.uid() AND role IN ('CAPTAIN', 'MANAGER'))
  OR team_id IN (
    SELECT st.team_id FROM structures_teams st
    JOIN structures_users su ON st.structure_id = su.structure_id
    WHERE su.user_id = auth.uid() AND su.role = 'ADMIN'
  )
  OR user_id = auth.uid()
);


-- STRUCTURES_TEAMS
ALTER TABLE "structures_teams" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture liaisons structures_teams" ON "structures_teams" FOR SELECT TO authenticated 
USING (structure_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid()));

CREATE POLICY "Gestion liaisons structures_teams par admins" ON "structures_teams" FOR INSERT TO authenticated 
WITH CHECK (structure_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Suppression liaisons structures_teams par admins" ON "structures_teams" FOR DELETE TO authenticated 
USING (structure_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN'));


-- TOURNAMENTS
ALTER TABLE "tournaments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are viewable by everyone" ON "tournaments" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tournaments" ON "tournaments" FOR INSERT TO authenticated WITH CHECK (auth.uid () = created_by);
CREATE POLICY "Creators can update tournaments" ON "tournaments" FOR UPDATE TO authenticated USING (auth.uid () = created_by);
CREATE POLICY "Creators can delete tournaments" ON "tournaments" FOR DELETE TO authenticated USING (auth.uid () = created_by);


-- TOURNAMENT REGISTRATIONS
ALTER TABLE "tournament_registrations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inscriptions tournois visibles par tous" ON "tournament_registrations" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register teams" ON "tournament_registrations" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update registrations" ON "tournament_registrations" FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Suppression d'une inscription" ON "tournament_registrations" FOR DELETE TO authenticated USING (true);


-- MATCHES
ALTER TABLE "matches" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone" ON "matches" FOR SELECT USING (true);
CREATE POLICY "Tournament creators can manage matches" ON "matches" FOR ALL TO authenticated USING (true);


-- OVERLAY SETTINGS
ALTER TABLE "overlay_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Overlay settings are viewable by everyone" ON "overlay_settings" FOR SELECT USING (true);
CREATE POLICY "Tournament creators can manage overlays" ON "overlay_settings" FOR ALL TO authenticated USING (true);


-- INVITATIONS
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des invitations reçues ou envoyées" ON "invitations" FOR SELECT TO authenticated 
USING (
  email = (SELECT email FROM users WHERE id = auth.uid())
  OR invited_by = auth.uid()
  OR target_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN')
  OR target_id IN (SELECT team_id FROM teams_users WHERE user_id = auth.uid() AND role IN ('CAPTAIN', 'MANAGER'))
);

CREATE POLICY "Création d'invitations par les admins ou capitaines" ON "invitations" FOR INSERT TO authenticated 
WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Mise à jour des invitations (acceptation/refus)" ON "invitations" FOR UPDATE TO authenticated 
USING (
  email = (SELECT email FROM users WHERE id = auth.uid())
  OR invited_by = auth.uid()
);

CREATE POLICY "Suppression des invitations" ON "invitations" FOR DELETE TO authenticated 
USING (
  invited_by = auth.uid()
  OR target_id IN (SELECT structure_id FROM structures_users WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- ==========================================
-- SCRIPT DE SEED SUPABASE (CORRIGÉ & VALIDE) - HUBGAMERS
-- ==========================================

-- 1. INSERTION DES UTILISATEURS DE TEST
INSERT INTO "users" ("id", "email", "avatar_url", "created_at") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin.esport@hubgamers.test', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', NOW() - INTERVAL '30 days'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'captain.alpha@hubgamers.test', 'https://api.dicebear.com/7.x/bottts/svg?seed=alpha', NOW() - INTERVAL '25 days'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'captain.beta@hubgamers.test', 'https://api.dicebear.com/7.x/bottts/svg?seed=beta', NOW() - INTERVAL '20 days'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'player.gamma@hubgamers.test', 'https://api.dicebear.com/7.x/bottts/svg?seed=gamma', NOW() - INTERVAL '15 days'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55', 'player.delta@hubgamers.test', 'https://api.dicebear.com/7.x/bottts/svg?seed=delta', NOW() - INTERVAL '10 days');


-- 2. INSERTION DES STRUCTURES (ORGANISATIONS / CLUBS)
INSERT INTO "structures" ("id", "name", "created_by", "created_at") VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'Team Vitalis Esports', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '28 days'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380202', 'Apex Gaming Club', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', NOW() - INTERVAL '22 days');


-- 3. ASSOCIATION USERS <-> STRUCTURES (structures_users)
INSERT INTO "structures_users" ("structure_id", "user_id", "role") VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ADMIN'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380101', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'USER'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380202', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'ADMIN'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380202', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55', 'USER');


-- 4. CRÉATION DU TOURNOI DE 16 ÉQUIPES
INSERT INTO "tournaments" ("id", "name", "game", "platform", "status", "created_by", "created_at") VALUES
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', 'HubGamers Master Cup 16T', 'Rainbow Six Siege', 'PC', 'ONGOING', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '2 days');


-- 5. CRÉATION DES 16 ÉQUIPES DE TEST
INSERT INTO "teams" ("id", "name", "game", "platform", "created_at") VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', 'Team Vitalis', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381002', 'Apex Gaming', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381003', 'Karmine Corp', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381004', 'G2 Esports', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381005', 'Fnatic', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381006', 'Team Liquid', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381007', 'FaZe Clan', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381008', 'Natus Vincere', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381009', 'DarkZero', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381010', 'SSG (SpaceStation)', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381011', 'BDS Esport', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381012', 'M80', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381013', 'Wolves Esports', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381014', 'Heroic', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381015', 'CAG Osaka', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381016', 'Elevate', 'Rainbow Six Siege', 'PC', NOW() - INTERVAL '3 days');


-- 6. ASSOCIATION DES MEMBRES AUX ÉQUIPES (teams_users)
INSERT INTO "teams_users" ("team_id", "user_id", "role", "created_at") VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'CAPTAIN', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'PLAYER', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381002', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'CAPTAIN', NOW() - INTERVAL '3 days'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd381002', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55', 'PLAYER', NOW() - INTERVAL '3 days');


-- 7. INSCRIPTION DES 16 ÉQUIPES AU TOURNOI (tournament_registrations)
INSERT INTO "tournament_registrations" ("tournament_id", "team_id", "status", "registered_at") VALUES
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381002', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381003', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381004', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381005', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381006', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381007', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381008', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381009', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381010', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381011', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381012', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381013', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381014', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381015', 'CHECKED_IN', NOW() - INTERVAL '2 days'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381016', 'CHECKED_IN', NOW() - INTERVAL '2 days');


-- 8. PARAMÈTRES D'OVERLAY (overlay_settings)
INSERT INTO "overlay_settings" ("id", "tournament_id", "primary_color", "secondary_color", "show_logo", "custom_logo_url", "created_at") VALUES
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380701', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '#3B82F6', '#1E293B', true, 'https://api.dicebear.com/7.x/identicon/svg?seed=hubgamers-cup', NOW() - INTERVAL '2 days');


-- 9. CRÉATION DES 15 MATCHS DE L'ARBRE (matches)
-- ROUND 1 (Huitièmes de finale - 8 matchs)
INSERT INTO "matches" ("id", "tournament_id", "alpha_team_id", "beta_team_id", "score_alpha", "score_beta", "winner_id", "round_number", "match_order", "status", "created_at") VALUES
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389001', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381002', 7, 4, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', 1, 1, 'COMPLETED', NOW() - INTERVAL '24 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389002', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381003', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381004', 5, 7, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381004', 1, 2, 'COMPLETED', NOW() - INTERVAL '24 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389003', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381005', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381006', 7, 3, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381005', 1, 3, 'COMPLETED', NOW() - INTERVAL '24 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389004', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381007', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381008', 6, 8, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381008', 1, 4, 'COMPLETED', NOW() - INTERVAL '24 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389005', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381009', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381010', 7, 2, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381009', 1, 5, 'COMPLETED', NOW() - INTERVAL '24 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389006', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381011', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381012', 4, 7, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381012', 1, 6, 'COMPLETED', NOW() - INTERVAL '24 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389007', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381013', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381014', 7, 5, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381013', 1, 7, 'COMPLETED', NOW() - INTERVAL '24 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389008', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381015', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381016', 3, 7, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381016', 1, 8, 'COMPLETED', NOW() - INTERVAL '24 hours');

-- ROUND 2 (Quarts de finale - 4 matchs)
INSERT INTO "matches" ("id", "tournament_id", "alpha_team_id", "beta_team_id", "score_alpha", "score_beta", "winner_id", "round_number", "match_order", "status", "created_at") VALUES
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389009', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381004', 7, 5, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', 2, 1, 'COMPLETED', NOW() - INTERVAL '12 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389010', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381005', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381008', 3, 7, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381008', 2, 2, 'COMPLETED', NOW() - INTERVAL '12 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389011', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381009', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381012', 7, 6, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381009', 2, 3, 'COMPLETED', NOW() - INTERVAL '12 hours'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389012', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381013', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381016', 7, 2, '30eebc99-9c0b-4ef8-bb6d-6bb9bd381013', 2, 4, 'COMPLETED', NOW() - INTERVAL '12 hours');

-- ROUND 3 (Demi-finales - 2 matchs)
INSERT INTO "matches" ("id", "tournament_id", "alpha_team_id", "beta_team_id", "score_alpha", "score_beta", "winner_id", "round_number", "match_order", "status", "created_at") VALUES
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389013', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381001', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381008', 4, 4, NULL, 3, 1, 'LIVE', NOW() - INTERVAL '1 hour'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389014', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381009', '30eebc99-9c0b-4ef8-bb6d-6bb9bd381013', 0, 0, NULL, 3, 2, 'PENDING', NOW() - INTERVAL '1 hour');

-- ROUND 4 (Finale - 1 match)
INSERT INTO "matches" ("id", "tournament_id", "alpha_team_id", "beta_team_id", "score_alpha", "score_beta", "winner_id", "round_number", "match_order", "status", "created_at") VALUES
('60eebc99-9c0b-4ef8-bb6d-6bb9bd389015', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380999', NULL, NULL, 0, 0, NULL, 4, 1, 'PENDING', NOW() - INTERVAL '1 hour');