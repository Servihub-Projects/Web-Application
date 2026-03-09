CREATE TABLE "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"company" text,
	"use_case" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
