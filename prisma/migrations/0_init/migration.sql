-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('WAIT', 'ACCEPTED', 'REFUSED');

-- CreateEnum
CREATE TYPE "SquadMemberStatus" AS ENUM ('INVITE', 'JOINED');

-- CreateTable
CREATE TABLE "bo_options" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "bo_options_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "club_roles" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "club_roles_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "slug" VARCHAR NOT NULL,
    "recruit_open" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs_members" (
    "user_id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "role_code" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "clubs_members_pkey" PRIMARY KEY ("user_id","club_id")
);

-- CreateTable
CREATE TABLE "dispute_statuses" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "dispute_statuses_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "invitation_target_types" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "invitation_target_types_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR NOT NULL,
    "inviter_id" UUID NOT NULL,
    "target_type_code" VARCHAR NOT NULL,
    "target_id" UUID NOT NULL,
    "status" VARCHAR NOT NULL,
    "max_uses" INTEGER DEFAULT 1,
    "uses_count" INTEGER DEFAULT 0,
    "expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_arbiters" (
    "match_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_arbiters_pkey" PRIMARY KEY ("match_id","user_id")
);

-- CreateTable
CREATE TABLE "match_disputes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "opened_by_user_id" UUID,
    "handled_by_user_id" UUID,
    "reason" TEXT NOT NULL,
    "status_code" VARCHAR NOT NULL,
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "match_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_map_vetos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "roster_id" UUID NOT NULL,
    "map_name" VARCHAR NOT NULL,
    "action_code" VARCHAR NOT NULL,
    "order_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_map_vetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "uploaded_by_user_id" UUID NOT NULL,
    "media_type_code" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_media_types" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "match_media_types_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "match_statuses" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "match_statuses_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR,
    "read_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overlay_types" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "overlay_types_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "rosters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "platform" VARCHAR,
    "game" VARCHAR,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rosters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rosters_members" (
    "user_id" UUID NOT NULL,
    "roster_id" UUID NOT NULL,
    "role_code" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "rosters_members_pkey" PRIMARY KEY ("user_id","roster_id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "logo_url" VARCHAR NOT NULL,
    "website_url" VARCHAR,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_member_roles" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "squad_member_roles_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "squad_types" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "squad_types_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "squads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "type_code" VARCHAR NOT NULL,
    "game" VARCHAR,
    "platform" VARCHAR,
    "nb_places" INTEGER,
    "micro_required" BOOLEAN DEFAULT false,
    "level" VARCHAR,
    "role_searched" VARCHAR,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "squads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squads_members" (
    "user_id" UUID NOT NULL,
    "squad_id" UUID NOT NULL,
    "role_code" VARCHAR NOT NULL,
    "status" "SquadMemberStatus" NOT NULL,

    CONSTRAINT "squads_members_pkey" PRIMARY KEY ("user_id","squad_id")
);

-- CreateTable
CREATE TABLE "studio_overlays" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studio_id" UUID NOT NULL,
    "type_code" VARCHAR NOT NULL,
    "access_token" VARCHAR NOT NULL,
    "is_enabled" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "studio_overlays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_scenes_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studio_id" UUID NOT NULL,
    "primary_color" VARCHAR DEFAULT '#00F0FF',
    "secondary_color" VARCHAR DEFAULT '#FF0055',
    "font_family" VARCHAR DEFAULT 'Inter',
    "show_sponsors" BOOLEAN DEFAULT true,
    "show_casters" BOOLEAN DEFAULT true,
    "custom_css" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "studio_scenes_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" UUID NOT NULL,
    "tournament_id" UUID,
    "active_match_id" UUID,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "studios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_roles" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "team_roles_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "tournament_member_roles" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "tournament_member_roles_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "tournament_prizes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tournament_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "percentage" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_registration_statuses" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "tournament_registration_statuses_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "tournament_sponsors" (
    "tournament_id" UUID NOT NULL,
    "sponsor_id" UUID NOT NULL,
    "tier" VARCHAR,

    CONSTRAINT "tournament_sponsors_pkey" PRIMARY KEY ("tournament_id","sponsor_id")
);

-- CreateTable
CREATE TABLE "tournament_stage_statuses" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "tournament_stage_statuses_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "tournament_stage_types" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "tournament_stage_types_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "tournament_statuses" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "tournament_statuses_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "tournament_streams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tournament_id" UUID NOT NULL,
    "match_id" UUID,
    "platform" VARCHAR,
    "channel_name" VARCHAR NOT NULL,
    "stream_url" VARCHAR NOT NULL,
    "language" VARCHAR DEFAULT 'fr',
    "is_official" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tournament_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "game" VARCHAR,
    "status_code" VARCHAR NOT NULL,
    "format" VARCHAR,
    "platform" VARCHAR,
    "cashprize" DECIMAL(10,2) DEFAULT 0,
    "prix_entree" VARCHAR,
    "nb_rosters" INTEGER,
    "checkin_enabled" BOOLEAN DEFAULT true,
    "checkin_start_at" TIMESTAMP(6),
    "checkin_end_at" TIMESTAMP(6),
    "start_at" TIMESTAMP(6),
    "end_at" TIMESTAMP(6),
    "registration_start_at" TIMESTAMP(6),
    "registration_end_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments_match_games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "game_number" INTEGER,
    "map_name" VARCHAR,
    "roster1_score" INTEGER DEFAULT 0,
    "roster2_score" INTEGER DEFAULT 0,
    "winner_roster_id" UUID,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tournaments_match_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stage_id" UUID NOT NULL,
    "roster1_id" UUID,
    "roster2_id" UUID,
    "winner_roster_id" UUID,
    "status_code" VARCHAR NOT NULL,
    "round_number" INTEGER,
    "roster1_checked_in" BOOLEAN DEFAULT false,
    "roster2_checked_in" BOOLEAN DEFAULT false,
    "scheduled_at" TIMESTAMP(6),
    "started_at" TIMESTAMP(6),
    "ended_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tournaments_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments_members" (
    "user_id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "role_code" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_members_pkey" PRIMARY KEY ("user_id","tournament_id")
);

-- CreateTable
CREATE TABLE "tournaments_registrations" (
    "roster_id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "status_code" VARCHAR NOT NULL,
    "checked_in" BOOLEAN DEFAULT false,
    "checked_in_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tournaments_registrations_pkey" PRIMARY KEY ("roster_id","tournament_id")
);

-- CreateTable
CREATE TABLE "tournaments_stages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tournament_id" UUID NOT NULL,
    "name" VARCHAR,
    "type_code" VARCHAR NOT NULL,
    "status_code" VARCHAR NOT NULL,
    "nb_team" INTEGER,
    "bo_code" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tournaments_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_game_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "game" VARCHAR NOT NULL,
    "in_game_name" VARCHAR NOT NULL,
    "game_user_id" VARCHAR,
    "verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_game_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR NOT NULL,
    "display_name" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veto_actions" (
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_default" BOOLEAN DEFAULT false,

    CONSTRAINT "veto_actions_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "_clubsTorosters" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_clubsTorosters_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "invitations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "rosters_slug_key" ON "rosters"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "studio_overlays_access_token_key" ON "studio_overlays"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_slug_key" ON "tournaments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_game_accounts_user_id_game_idx" ON "user_game_accounts"("user_id", "game");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "_clubsTorosters_B_index" ON "_clubsTorosters"("B");

-- AddForeignKey
ALTER TABLE "clubs_members" ADD CONSTRAINT "clubs_members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubs_members" ADD CONSTRAINT "clubs_members_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "club_roles"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubs_members" ADD CONSTRAINT "clubs_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_target_type_code_fkey" FOREIGN KEY ("target_type_code") REFERENCES "invitation_target_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_arbiters" ADD CONSTRAINT "match_arbiters_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "tournaments_matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_arbiters" ADD CONSTRAINT "match_arbiters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_disputes" ADD CONSTRAINT "match_disputes_handled_by_user_id_fkey" FOREIGN KEY ("handled_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_disputes" ADD CONSTRAINT "match_disputes_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "tournaments_matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_disputes" ADD CONSTRAINT "match_disputes_opened_by_user_id_fkey" FOREIGN KEY ("opened_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_disputes" ADD CONSTRAINT "match_disputes_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "dispute_statuses"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_map_vetos" ADD CONSTRAINT "match_map_vetos_action_code_fkey" FOREIGN KEY ("action_code") REFERENCES "veto_actions"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_map_vetos" ADD CONSTRAINT "match_map_vetos_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "tournaments_matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_map_vetos" ADD CONSTRAINT "match_map_vetos_roster_id_fkey" FOREIGN KEY ("roster_id") REFERENCES "rosters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_media" ADD CONSTRAINT "match_media_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "tournaments_matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_media" ADD CONSTRAINT "match_media_media_type_code_fkey" FOREIGN KEY ("media_type_code") REFERENCES "match_media_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "match_media" ADD CONSTRAINT "match_media_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rosters_members" ADD CONSTRAINT "rosters_members_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "team_roles"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rosters_members" ADD CONSTRAINT "rosters_members_roster_id_fkey" FOREIGN KEY ("roster_id") REFERENCES "rosters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rosters_members" ADD CONSTRAINT "rosters_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squads" ADD CONSTRAINT "squads_type_code_fkey" FOREIGN KEY ("type_code") REFERENCES "squad_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squads_members" ADD CONSTRAINT "squads_members_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "squad_member_roles"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squads_members" ADD CONSTRAINT "squads_members_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "squads_members" ADD CONSTRAINT "squads_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "studio_overlays" ADD CONSTRAINT "studio_overlays_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "studio_overlays" ADD CONSTRAINT "studio_overlays_type_code_fkey" FOREIGN KEY ("type_code") REFERENCES "overlay_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "studio_scenes_config" ADD CONSTRAINT "studio_scenes_config_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_active_match_id_fkey" FOREIGN KEY ("active_match_id") REFERENCES "tournaments_matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_prizes" ADD CONSTRAINT "tournament_prizes_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_sponsors" ADD CONSTRAINT "tournament_sponsors_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_sponsors" ADD CONSTRAINT "tournament_sponsors_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_streams" ADD CONSTRAINT "tournament_streams_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "tournaments_matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_streams" ADD CONSTRAINT "tournament_streams_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "tournament_statuses"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_match_games" ADD CONSTRAINT "tournaments_match_games_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "tournaments_matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_match_games" ADD CONSTRAINT "tournaments_match_games_winner_roster_id_fkey" FOREIGN KEY ("winner_roster_id") REFERENCES "rosters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_matches" ADD CONSTRAINT "tournaments_matches_roster1_id_fkey" FOREIGN KEY ("roster1_id") REFERENCES "rosters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_matches" ADD CONSTRAINT "tournaments_matches_roster2_id_fkey" FOREIGN KEY ("roster2_id") REFERENCES "rosters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_matches" ADD CONSTRAINT "tournaments_matches_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "tournaments_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_matches" ADD CONSTRAINT "tournaments_matches_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "match_statuses"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_matches" ADD CONSTRAINT "tournaments_matches_winner_roster_id_fkey" FOREIGN KEY ("winner_roster_id") REFERENCES "rosters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_members" ADD CONSTRAINT "tournaments_members_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "tournament_member_roles"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_members" ADD CONSTRAINT "tournaments_members_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_members" ADD CONSTRAINT "tournaments_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_registrations" ADD CONSTRAINT "tournaments_registrations_roster_id_fkey" FOREIGN KEY ("roster_id") REFERENCES "rosters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_registrations" ADD CONSTRAINT "tournaments_registrations_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "tournament_registration_statuses"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_registrations" ADD CONSTRAINT "tournaments_registrations_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_stages" ADD CONSTRAINT "tournaments_stages_bo_code_fkey" FOREIGN KEY ("bo_code") REFERENCES "bo_options"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_stages" ADD CONSTRAINT "tournaments_stages_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "tournament_stage_statuses"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_stages" ADD CONSTRAINT "tournaments_stages_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments_stages" ADD CONSTRAINT "tournaments_stages_type_code_fkey" FOREIGN KEY ("type_code") REFERENCES "tournament_stage_types"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_game_accounts" ADD CONSTRAINT "user_game_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_clubsTorosters" ADD CONSTRAINT "_clubsTorosters_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clubsTorosters" ADD CONSTRAINT "_clubsTorosters_B_fkey" FOREIGN KEY ("B") REFERENCES "rosters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

