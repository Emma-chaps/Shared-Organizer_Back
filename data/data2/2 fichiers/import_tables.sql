BEGIN;

/* On commence par supprimer les tables si elles existent */
/* On rajoute CASCADE pour ne pas avoir de probleme de références cassées */
DROP TABLE IF EXISTS "list" CASCADE;
DROP TABLE IF EXISTS "card" CASCADE;
DROP TABLE IF EXISTS "label" CASCADE;
DROP TABLE IF EXISTS "card_label" CASCADE;

CREATE TABLE IF NOT EXISTS "list" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "card" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "color" TEXT,
    "position" INTEGER NOT NULL,
    "list_id" INTEGER NOT NULL REFERENCES "list"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "label" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT
);

COMMIT;
