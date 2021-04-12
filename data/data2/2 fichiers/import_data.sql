
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
