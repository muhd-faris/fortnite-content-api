CREATE TYPE "public"."tournament_region_enum" AS ENUM('asia', 'br', 'eu', 'me', 'oce', 'nae', 'naw', 'nac', 'onsite');--> statement-breakpoint
CREATE TABLE "fortnite_crew" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crew_date" timestamp NOT NULL,
	"color_1" varchar NOT NULL,
	"color_2" varchar NOT NULL,
	"color_3" varchar NOT NULL,
	"image_with_bg" varchar NOT NULL,
	"rewards_id" varchar[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fortnite_tournament_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"epic_payout_id" varchar(255) NOT NULL,
	"region" "tournament_region_enum" NOT NULL,
	"payout_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "fortnite_tournament_payouts_epic_payout_id_unique" UNIQUE("epic_payout_id")
);
--> statement-breakpoint
CREATE TABLE "fortnite_tournament_scorings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"epic_score_id" varchar(255) NOT NULL,
	"region" "tournament_region_enum" NOT NULL,
	"scoring_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "fortnite_tournament_scorings_epic_score_id_unique" UNIQUE("epic_score_id")
);
--> statement-breakpoint
CREATE TABLE "fortnite_tournament_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"event_id" varchar(255),
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"epic_score_id" varchar,
	"epic_payout_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fortnite_tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"display_id" varchar(255) NOT NULL,
	"minimum_account_level" integer,
	"name" varchar(255),
	"details_description" varchar(2000),
	"playlist_tile_image" varchar(255),
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"region" "tournament_region_enum" NOT NULL,
	"platforms" varchar(255)[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "fortnite_tournaments_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "season_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter" integer NOT NULL,
	"season_code" integer NOT NULL,
	"season_in_chapter" integer NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fortnite_tournament_sessions" ADD CONSTRAINT "fortnite_tournament_sessions_event_id_fortnite_tournaments_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."fortnite_tournaments"("event_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fortnite_tournament_sessions" ADD CONSTRAINT "fortnite_tournament_sessions_epic_score_id_fortnite_tournament_scorings_epic_score_id_fk" FOREIGN KEY ("epic_score_id") REFERENCES "public"."fortnite_tournament_scorings"("epic_score_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fortnite_tournament_sessions" ADD CONSTRAINT "fortnite_tournament_sessions_epic_payout_id_fortnite_tournament_payouts_epic_payout_id_fk" FOREIGN KEY ("epic_payout_id") REFERENCES "public"."fortnite_tournament_payouts"("epic_payout_id") ON DELETE set null ON UPDATE no action;