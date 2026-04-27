CREATE TABLE IF NOT EXISTS "keyword_search_history" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "project_id" text NOT NULL,
  "user_id" text NOT NULL,
  "keyword" text NOT NULL,
  "location_code" integer NOT NULL,
  "location_name" text NOT NULL,
  "searched_at" integer NOT NULL,
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX IF NOT EXISTS "keyword_search_history_unique"
  ON "keyword_search_history" ("project_id","user_id","keyword","location_code");

CREATE INDEX IF NOT EXISTS "keyword_search_history_project_user_searched_idx"
  ON "keyword_search_history" ("project_id","user_id","searched_at");

