CREATE TABLE "fortnite_cosmetic_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" varchar NOT NULL,
	"image" varchar NOT NULL,
	"internal_name" varchar NOT NULL,
	"colors" varchar[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fortnite_crew" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crew_date" timestamp NOT NULL,
	"color_1" varchar NOT NULL,
	"color_2" varchar NOT NULL,
	"color_3" varchar NOT NULL,
	"image_with_bg" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter" integer NOT NULL,
	"season" integer NOT NULL,
	"season_in_chapter" integer NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
