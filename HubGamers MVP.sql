CREATE TYPE "StructureMemberRole" AS ENUM ('ADMIN', 'USER');

CREATE TYPE "TeamMemberRole" AS ENUM ('MANAGER', 'CAPTAIN', 'PLAYER');

CREATE TYPE "Platform" AS ENUM ('PC', 'PLAYSTATION', 'XBOX');

CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'ONGOING', 'COMPLETED');

CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CHECKED_IN');

CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'LIVE', 'COMPLETED');

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
    "role" "StructureMemberRole" DEFAULT 'USER'
  );

CREATE TABLE
  "teams" (
    "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid ()),
    "name" varchar(255) NOT NULL,
    "game" varchar(255) NOT NULL,
    "platform" "Platform" DEFAULT 'PC',
    "created_at" timestamptz DEFAULT (now ())
  );

CREATE TABLE
  "structures_teams" (
    "structure_id" uuid NOT NULL,
    "team_id" uuid NOT NULL,
    "role" "TeamMemberRole" DEFAULT 'PLAYER'
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

ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

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

CREATE UNIQUE INDEX ON "tournament_registrations" ("tournament_id", "team_id");

COMMENT ON COLUMN "structures"."created_by" IS 'Créateur';

COMMENT ON COLUMN "matches"."alpha_team_id" IS 'Peut être NULL si en attente du tour précédent';

COMMENT ON COLUMN "matches"."beta_team_id" IS 'Peut être NULL si en attente du tour précédent';

COMMENT ON COLUMN "matches"."round_number" IS '1 = Quarts, 2 = Demies, etc.';

COMMENT ON COLUMN "matches"."match_order" IS 'Position du match dans le round';

ALTER TABLE "structures" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "structures_users" ADD FOREIGN KEY ("structure_id") REFERENCES "structures" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "structures_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "structures_teams" ADD FOREIGN KEY ("structure_id") REFERENCES "structures" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "structures_teams" ADD FOREIGN KEY ("team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_registrations" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_registrations" ADD FOREIGN KEY ("team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "matches" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "matches" ADD FOREIGN KEY ("alpha_team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "matches" ADD FOREIGN KEY ("beta_team_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "matches" ADD FOREIGN KEY ("winner_id") REFERENCES "teams" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "overlay_settings" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;