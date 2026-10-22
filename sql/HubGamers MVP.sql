CREATE TABLE "users" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "display_name" varchar NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "user_game_accounts" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "game" varchar NOT NULL,
  "in_game_name" varchar NOT NULL,
  "game_user_id" varchar,
  "verified" boolean DEFAULT false,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "clubs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar NOT NULL,
  "description" text,
  "slug" varchar UNIQUE NOT NULL,
  "recruit_open" boolean DEFAULT false,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "clubs_members" (
  "user_id" UUID,
  "club_id" UUID,
  "role_code" varchar NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp,
  PRIMARY KEY ("user_id", "club_id")
);

CREATE TABLE "club_roles" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "rosters" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar NOT NULL,
  "slug" varchar UNIQUE NOT NULL,
  "platform" varchar,
  "game" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "rosters_members" (
  "user_id" UUID,
  "roster_id" UUID,
  "role_code" varchar NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp,
  PRIMARY KEY ("user_id", "roster_id")
);

CREATE TABLE "team_roles" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "squads" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar NOT NULL,
  "type_code" varchar NOT NULL,
  "game" varchar,
  "platform" varchar,
  "nb_places" int,
  "micro_required" boolean DEFAULT false,
  "level" varchar,
  "role_searched" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "squad_types" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "squads_members" (
  "user_id" UUID,
  "squad_id" UUID,
  "role_code" varchar NOT NULL,
  PRIMARY KEY ("user_id", "squad_id")
);

CREATE TABLE "squad_member_roles" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournaments" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar NOT NULL,
  "slug" varchar UNIQUE NOT NULL,
  "game" varchar,
  "status_code" varchar NOT NULL,
  "format" varchar,
  "platform" varchar,
  "cashprize" decimal(10,2) DEFAULT 0,
  "prix_entree" varchar,
  "nb_rosters" int,
  "checkin_enabled" boolean DEFAULT true,
  "checkin_start_at" timestamp,
  "checkin_end_at" timestamp,
  "start_at" timestamp,
  "end_at" timestamp,
  "registration_start_at" timestamp,
  "registration_end_at" timestamp,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "tournament_statuses" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournament_prizes" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tournament_id" UUID NOT NULL,
  "position" int NOT NULL,
  "amount" decimal(10,2) NOT NULL,
  "percentage" decimal(5,2),
  "created_at" timestamp
);

CREATE TABLE "sponsors" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar NOT NULL,
  "logo_url" varchar NOT NULL,
  "website_url" varchar,
  "created_at" timestamp
);

CREATE TABLE "tournament_sponsors" (
  "tournament_id" UUID,
  "sponsor_id" UUID,
  "tier" varchar,
  PRIMARY KEY ("tournament_id", "sponsor_id")
);

CREATE TABLE "tournaments_members" (
  "user_id" UUID,
  "tournament_id" UUID,
  "role_code" varchar NOT NULL,
  "created_at" timestamp,
  PRIMARY KEY ("user_id", "tournament_id")
);

CREATE TABLE "tournament_member_roles" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournaments_stages" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tournament_id" UUID NOT NULL,
  "name" varchar,
  "type_code" varchar NOT NULL,
  "status_code" varchar NOT NULL,
  "nb_team" int,
  "bo_code" varchar NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "tournament_stage_types" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournament_stage_statuses" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "bo_options" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournaments_registrations" (
  "roster_id" UUID,
  "tournament_id" UUID,
  "status_code" varchar NOT NULL,
  "checked_in" boolean DEFAULT false,
  "checked_in_at" timestamp,
  "created_at" timestamp,
  "updated_at" timestamp,
  PRIMARY KEY ("roster_id", "tournament_id")
);

CREATE TABLE "tournament_registration_statuses" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournaments_matches" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "stage_id" UUID NOT NULL,
  "roster1_id" UUID,
  "roster2_id" UUID,
  "winner_roster_id" UUID,
  "status_code" varchar NOT NULL,
  "round_number" int,
  "roster1_checked_in" boolean DEFAULT false,
  "roster2_checked_in" boolean DEFAULT false,
  "scheduled_at" timestamp,
  "started_at" timestamp,
  "ended_at" timestamp,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "match_statuses" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournaments_match_games" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "match_id" UUID NOT NULL,
  "game_number" int,
  "map_name" varchar,
  "roster1_score" int DEFAULT 0,
  "roster2_score" int DEFAULT 0,
  "winner_roster_id" UUID,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "match_media" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "match_id" UUID NOT NULL,
  "uploaded_by_user_id" UUID NOT NULL,
  "media_type_code" varchar NOT NULL,
  "url" varchar NOT NULL,
  "created_at" timestamp
);

CREATE TABLE "match_media_types" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "match_map_vetos" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "match_id" UUID NOT NULL,
  "roster_id" UUID NOT NULL,
  "map_name" varchar NOT NULL,
  "action_code" varchar NOT NULL,
  "order_number" int NOT NULL,
  "created_at" timestamp
);

CREATE TABLE "veto_actions" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "match_arbiters" (
  "match_id" UUID,
  "user_id" UUID,
  "assigned_at" timestamp,
  PRIMARY KEY ("match_id", "user_id")
);

CREATE TABLE "match_disputes" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "match_id" UUID NOT NULL,
  "opened_by_user_id" UUID,
  "handled_by_user_id" UUID,
  "reason" text NOT NULL,
  "status_code" varchar NOT NULL,
  "resolution_notes" text,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "dispute_statuses" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "tournament_streams" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tournament_id" UUID NOT NULL,
  "match_id" UUID,
  "platform" varchar,
  "channel_name" varchar NOT NULL,
  "stream_url" varchar NOT NULL,
  "language" varchar DEFAULT 'fr',
  "is_official" boolean DEFAULT true,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "studios" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "owner_user_id" UUID NOT NULL,
  "tournament_id" UUID,
  "active_match_id" UUID,
  "name" varchar NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "studio_overlays" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "studio_id" UUID NOT NULL,
  "type_code" varchar NOT NULL,
  "access_token" varchar UNIQUE NOT NULL,
  "is_enabled" boolean DEFAULT true,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "overlay_types" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "studio_scenes_config" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "studio_id" UUID NOT NULL,
  "primary_color" varchar DEFAULT '#00F0FF',
  "secondary_color" varchar DEFAULT '#FF0055',
  "font_family" varchar DEFAULT 'Inter',
  "show_sponsors" boolean DEFAULT true,
  "show_casters" boolean DEFAULT true,
  "custom_css" text,
  "updated_at" timestamp
);

CREATE TABLE "invitations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "code" varchar UNIQUE NOT NULL,
  "inviter_id" UUID NOT NULL,
  "target_type_code" varchar NOT NULL,
  "target_id" UUID NOT NULL,
  "max_uses" int DEFAULT 1,
  "uses_count" int DEFAULT 0,
  "expires_at" timestamp,
  "created_at" timestamp
);

CREATE TABLE "invitation_target_types" (
  "code" varchar PRIMARY KEY,
  "label" varchar NOT NULL,
  "is_default" boolean DEFAULT false
);

CREATE TABLE "notifications" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "title" varchar NOT NULL,
  "message" text NOT NULL,
  "type" varchar,
  "read_at" timestamp,
  "created_at" timestamp
);

CREATE UNIQUE INDEX ON "user_game_accounts" ("user_id", "game");

ALTER TABLE "user_game_accounts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clubs_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clubs_members" ADD FOREIGN KEY ("club_id") REFERENCES "clubs" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "clubs_members" ADD FOREIGN KEY ("role_code") REFERENCES "club_roles" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "rosters_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "rosters_members" ADD FOREIGN KEY ("roster_id") REFERENCES "rosters" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "rosters_members" ADD FOREIGN KEY ("role_code") REFERENCES "team_roles" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "squads" ADD FOREIGN KEY ("type_code") REFERENCES "squad_types" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "squads_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "squads_members" ADD FOREIGN KEY ("squad_id") REFERENCES "squads" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "squads_members" ADD FOREIGN KEY ("role_code") REFERENCES "squad_member_roles" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments" ADD FOREIGN KEY ("status_code") REFERENCES "tournament_statuses" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_prizes" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_sponsors" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_sponsors" ADD FOREIGN KEY ("sponsor_id") REFERENCES "sponsors" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_members" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_members" ADD FOREIGN KEY ("role_code") REFERENCES "tournament_member_roles" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_stages" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_stages" ADD FOREIGN KEY ("type_code") REFERENCES "tournament_stage_types" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_stages" ADD FOREIGN KEY ("status_code") REFERENCES "tournament_stage_statuses" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_stages" ADD FOREIGN KEY ("bo_code") REFERENCES "bo_options" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_registrations" ADD FOREIGN KEY ("roster_id") REFERENCES "rosters" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_registrations" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_registrations" ADD FOREIGN KEY ("status_code") REFERENCES "tournament_registration_statuses" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_matches" ADD FOREIGN KEY ("stage_id") REFERENCES "tournaments_stages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_matches" ADD FOREIGN KEY ("roster1_id") REFERENCES "rosters" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_matches" ADD FOREIGN KEY ("roster2_id") REFERENCES "rosters" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_matches" ADD FOREIGN KEY ("winner_roster_id") REFERENCES "rosters" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_matches" ADD FOREIGN KEY ("status_code") REFERENCES "match_statuses" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_match_games" ADD FOREIGN KEY ("match_id") REFERENCES "tournaments_matches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournaments_match_games" ADD FOREIGN KEY ("winner_roster_id") REFERENCES "rosters" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_media" ADD FOREIGN KEY ("match_id") REFERENCES "tournaments_matches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_media" ADD FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_media" ADD FOREIGN KEY ("media_type_code") REFERENCES "match_media_types" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_map_vetos" ADD FOREIGN KEY ("match_id") REFERENCES "tournaments_matches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_map_vetos" ADD FOREIGN KEY ("roster_id") REFERENCES "rosters" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_map_vetos" ADD FOREIGN KEY ("action_code") REFERENCES "veto_actions" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_arbiters" ADD FOREIGN KEY ("match_id") REFERENCES "tournaments_matches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_arbiters" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_disputes" ADD FOREIGN KEY ("match_id") REFERENCES "tournaments_matches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_disputes" ADD FOREIGN KEY ("opened_by_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_disputes" ADD FOREIGN KEY ("handled_by_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "match_disputes" ADD FOREIGN KEY ("status_code") REFERENCES "dispute_statuses" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_streams" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tournament_streams" ADD FOREIGN KEY ("match_id") REFERENCES "tournaments_matches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studios" ADD FOREIGN KEY ("owner_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studios" ADD FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studios" ADD FOREIGN KEY ("active_match_id") REFERENCES "tournaments_matches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studio_overlays" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studio_overlays" ADD FOREIGN KEY ("type_code") REFERENCES "overlay_types" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "studio_scenes_config" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "invitations" ADD FOREIGN KEY ("inviter_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "invitations" ADD FOREIGN KEY ("target_type_code") REFERENCES "invitation_target_types" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;