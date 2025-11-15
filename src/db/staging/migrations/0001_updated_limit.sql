ALTER TABLE "fortnite_tournament_sessions" ALTER COLUMN "epic_score_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "fortnite_tournament_sessions" ALTER COLUMN "epic_payout_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "fortnite_tournaments" ALTER COLUMN "details_description" SET DATA TYPE varchar(2000);