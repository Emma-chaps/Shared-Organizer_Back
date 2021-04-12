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


CREATE TABLE IF NOT EXISTS "card_label" (
    "card_id" INTEGER NOT NULL REFERENCES "card"("id") ON DELETE CASCADE,
    "label_id" INTEGER NOT NULL REFERENCES "label"("id") ON DELETE CASCADE,
    PRIMARY KEY ("card_id", "label_id")
);

INSERT INTO "list" ("name", "position") VALUES
    ('To Do', 1),
    ('In progress', 2),
    ('Done', 3);

INSERT INTO "card" ("title", "color", "position", "list_id") VALUES
    ('Créer un MCD', NULL, 1, 1),
    ('Faire un Wireframe', NULL, 2, 1),
    ('Renvoyer contrat signé', 'red', 3, 1),
    ('Initialiser ExpressJS', NULL, 4, 1);

INSERT INTO "label" ("name", "color") VALUES
    ('Urgent', 'red'),
    ('JS', 'yellow');

INSERT INTO "card_label" ("card_id", "label_id") VALUES
    (1, 1),
    (2, 1),
    (4, 1),
    (4, 2);



/*
Si on force les id (on précise l'id d'une ligne lorsque l'on insert cette ligne) alors on doit mettre a jour manuellement la prochaine valeur de l'auto incrément

SELECT setval('list_id_seq', (SELECT MAX(id) from "list"));
SELECT setval('card_id_seq', (SELECT MAX(id) from "card"));
SELECT setval('label_id_seq', (SELECT MAX(id) from "label"));
*/


COMMIT;