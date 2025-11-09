DROP TABLE "fortnite_cosmetic_series" CASCADE;--> statement-breakpoint
ALTER TABLE "fortnite_crew" ADD COLUMN "rewards_id" varchar[] DEFAULT '{}' NOT NULL;