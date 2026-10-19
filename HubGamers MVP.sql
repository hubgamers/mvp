-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE "StructureMemberRole" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "TeamMemberRole" AS ENUM ('MANAGER', 'CAPTAIN', 'PLAYER');
CREATE TYPE "Platform" AS ENUM ('PC', 'PLAYSTATION', 'XBOX');
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'ONGOING', 'COMPLETED');
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CHECKED_IN');
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'LIVE', 'COMPLETED');


-- ==========================================
-- 2. TABLES
-- ==========================================
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
    "email" varchar(255) UNIQUE NOT NULL,
    "avatar_url" text,
    "created_at" timestamptz DEFAULT (now ())
);

CREATE TABLE "structures" (
    "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
    "name" varchar(255) NOT NULL,
    "created_by" uuid NOT NULL,
    "created_at" timestamptz DEFAULT (now ())
);

CREATE TABLE "structures_users" (
    "structure_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" "StructureMemberRole" DEFAULT 'USER'
);

CREATE TABLE "teams" (
    "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
    "name" varchar(255) NOT NULL,
    "game" varchar(255) NOT NULL,
    "platform" "Platform" DEFAULT 'PC',
    "created_at" timestamptz DEFAULT (now ())
);

CREATE TABLE "structures_teams" (
    "structure_id" uuid NOT NULL,
    "team_id" uuid NOT NULL,
    "role" "TeamMemberRole" DEFAULT 'PLAYER'
);

CREATE TABLE "tournaments" (
    "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
    "name" varchar(255) NOT NULL,
    "game" varchar(255) NOT NULL,
    "platform" "Platform" DEFAULT 'PC',
    "status" "TournamentStatus" DEFAULT 'DRAFT',
    "created_by" uuid NOT NULL,
    "created_at" timestamptz DEFAULT (now ())
);

CREATE TABLE "tournament_registrations" (
    "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
    "tournament_id" uuid NOT NULL,
    "team_id" uuid NOT NULL,
    "status" "RegistrationStatus" DEFAULT 'PENDING',
    "registered_at" timestamptz DEFAULT (now ())
);

CREATE TABLE "matches" (
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

CREATE TABLE "overlay_settings" (
    "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
    "tournament_id" uuid UNIQUE NOT NULL,
    "primary_color" varchar(50) DEFAULT '#3B82F6',
    "secondary_color" varchar(50) DEFAULT '#1E293B',
    "show_logo" boolean DEFAULT true,
    "custom_logo_url" text,
    "created_at" timestamptz DEFAULT (now ())
);

CREATE UNIQUE INDEX ON "tournament_registrations" ("tournament_id", "team_id");


-- ==========================================
-- 3. FOREIGN KEYS
-- ==========================================
ALTER TABLE "structures" ADD CONSTRAINT "structures_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "structures_users" ADD FOREIGN KEY ("structure_id") REFERENCES "structures" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "structures_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "structures_teams" ADD FOREIGN KEY ("structure_id") REFERENCES "structures" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "structures_teams" ADD FOREIGN KEY ("team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "tournament_registrations" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "tournament_registrations" ADD FOREIGN KEY ("team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "matches" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "matches" ADD FOREIGN KEY ("alpha_team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "matches" ADD FOREIGN KEY ("beta_team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "matches" ADD FOREIGN KEY ("winner_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "overlay_settings" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- USERS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone" ON "users" FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON "users" FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON "users" FOR UPDATE TO authenticated USING (auth.uid() = id);

-- STRUCTURES
ALTER TABLE "structures" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Structures are viewable by everyone" ON "structures" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create structures" ON "structures" FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update structures" ON "structures" FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete structures" ON "structures" FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- TOURNAMENTS
ALTER TABLE "tournaments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments are viewable by everyone" ON "tournaments" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tournaments" ON "tournaments" FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update tournaments" ON "tournaments" FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete tournaments" ON "tournaments" FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- TEAMS
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams are viewable by everyone" ON "teams" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON "teams" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update teams" ON "teams" FOR UPDATE TO authenticated USING (true);

-- TOURNAMENT REGISTRATIONS
ALTER TABLE "tournament_registrations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrations are viewable by everyone" ON "tournament_registrations" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register teams" ON "tournament_registrations" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update registrations" ON "tournament_registrations" FOR UPDATE TO authenticated USING (true);

-- MATCHES
ALTER TABLE "matches" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches are viewable by everyone" ON "matches" FOR SELECT USING (true);
CREATE POLICY "Tournament creators can manage matches" ON "matches" FOR ALL TO authenticated USING (true);

-- OVERLAY SETTINGS
ALTER TABLE "overlay_settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Overlay settings are viewable by everyone" ON "overlay_settings" FOR SELECT USING (true);
CREATE POLICY "Tournament creators can manage overlays" ON "overlay_settings" FOR ALL TO authenticated USING (true);

-- ==========================================
-- 1. TEAMS (Équipes)
-- ==========================================
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams visibles par tous" 
ON "teams" FOR SELECT 
USING (true);

CREATE POLICY "Création d'équipes pour les authentifiés" 
ON "teams" FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Mise à jour d'équipes pour les authentifiés" 
ON "teams" FOR UPDATE 
TO authenticated 
USING (true);


-- ==========================================
-- 2. STRUCTURES_TEAMS (Liaison Structures <-> Équipes)
-- ==========================================
ALTER TABLE "structures_teams" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Liaisons structures/équipes visibles par tous" 
ON "structures_teams" FOR SELECT 
USING (true);

CREATE POLICY "Création de liaisons structures/équipes" 
ON "structures_teams" FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Suppression de liaisons structures/équipes" 
ON "structures_teams" FOR DELETE 
TO authenticated 
USING (true);


-- ==========================================
-- 3. STRUCTURES_USERS (Membres des structures)
-- ==========================================
ALTER TABLE "structures_users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membres de structures visibles par tous" 
ON "structures_users" FOR SELECT 
USING (true);

CREATE POLICY "Ajout de membres dans les structures" 
ON "structures_users" FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Mise à jour des rôles dans les structures" 
ON "structures_users" FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Suppression de membres des structures" 
ON "structures_users" FOR DELETE 
TO authenticated 
USING (true);


-- ==========================================
-- 4. TOURNAMENT_REGISTRATIONS (Inscriptions aux tournois)
-- ==========================================
ALTER TABLE "tournament_registrations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inscriptions tournois visibles par tous" 
ON "tournament_registrations" FOR SELECT 
USING (true);

CREATE POLICY "Inscription d'une équipe à un tournoi" 
ON "tournament_registrations" FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Mise à jour du statut d'inscription" 
ON "tournament_registrations" FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Suppression d'une inscription" 
ON "tournament_registrations" FOR DELETE 
TO authenticated 
USING (true);