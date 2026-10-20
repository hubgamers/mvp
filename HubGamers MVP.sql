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