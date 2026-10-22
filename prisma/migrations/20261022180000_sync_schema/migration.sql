
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('WAIT', 'ACCEPTED', 'REFUSED');

-- CreateEnum
CREATE TYPE "SquadMemberStatus" AS ENUM ('INVITE', 'JOINED');

-- AlterTable
ALTER TABLE "clubs"
    ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "clubs_members"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "invitations"
    ADD COLUMN "status" VARCHAR NOT NULL,
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "match_arbiters"
    ALTER COLUMN "assigned_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "match_disputes"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "match_map_vetos"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "match_media"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "notifications"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "rosters"
    ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "rosters_members"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sponsors"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "squads"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "squads_members"
    ADD COLUMN "status" "SquadMemberStatus" NOT NULL;

-- AlterTable
ALTER TABLE "studio_overlays"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "studios"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournament_prizes"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournament_streams"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournaments"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournaments_match_games"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournaments_matches"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournaments_members"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournaments_registrations"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tournaments_stages"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_game_accounts"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users"
    ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "_clubsTorosters" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_clubsTorosters_AB_pkey" PRIMARY KEY ("A", "B")
);

-- CreateIndex
CREATE INDEX "_clubsTorosters_B_index"
    ON "_clubsTorosters"("B");

-- AddForeignKey
ALTER TABLE "_clubsTorosters"
    ADD CONSTRAINT "_clubsTorosters_A_fkey"
    FOREIGN KEY ("A") REFERENCES "clubs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clubsTorosters"
    ADD CONSTRAINT "_clubsTorosters_B_fkey"
    FOREIGN KEY ("B") REFERENCES "rosters"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
