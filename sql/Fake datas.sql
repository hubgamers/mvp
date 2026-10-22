-- ==============================================================================
-- HUBGAMERS MVP - SEED DATA (JEU DE DONNÉES FICTIFS DENSE ET COHÉRENT - UUID)
-- Compatible PostgreSQL / Supabase
-- ==============================================================================

BEGIN;

-- 1. TABLES DE RÉFÉRENCE (LOOKUP TABLES) & VALEURS PAR DÉFAUT

INSERT INTO "club_roles" ("code", "label", "is_default") VALUES
('ADMIN', 'Administrateur', false),
('USER', 'Membre', true);

INSERT INTO "team_roles" ("code", "label", "is_default") VALUES
('CAPTAIN', 'Capitaine', false),
('PLAYER', 'Joueur', true);

INSERT INTO "squad_types" ("code", "label", "is_default") VALUES
('CASUAL', 'Casual / Détente', true),
('RANKED', 'Compétitif / Ranked', false),
('SCRIM', 'Entraînement / Scrim', false),
('FUN', 'Fun / Mini-jeux', false);

INSERT INTO "squad_member_roles" ("code", "label", "is_default") VALUES
('OWNER', 'Chef d escouade', false),
('PLAYER', 'Membre', true);

INSERT INTO "tournament_statuses" ("code", "label", "is_default") VALUES
('DRAFT', 'Brouillon', true),
('REGISTRATION', 'Inscriptions Ouvertes', false),
('CHECKIN', 'Check-in en cours', false),
('ONGOING', 'En cours', false),
('COMPLETED', 'Terminé', false),
('CANCELLED', 'Annulé', false);

INSERT INTO "tournament_member_roles" ("code", "label", "is_default") VALUES
('OWNER', 'Organisateur Principal', false),
('ADMIN', 'Administrateur Tournoi', false),
('ARBITRE', 'Arbitre Officiel', true),
('CASTER', 'Commentateur / Caster', false);

INSERT INTO "tournament_stage_types" ("code", "label", "is_default") VALUES
('SIMPLET_BRACKET', 'Arbre à élimination directe', true),
('DOUBLE_BRACKET', 'Arbre à double élimination', false),
('GROUP', 'Phase de poules', false);

INSERT INTO "tournament_stage_statuses" ("code", "label", "is_default") VALUES
('SCHEDULING', 'Planification', true),
('ONGOING', 'En cours', false),
('COMPLETED', 'Terminé', false);

INSERT INTO "bo_options" ("code", "label", "is_default") VALUES
('BO1', 'Best of 1', false),
('BO2', 'Best of 2', false),
('BO3', 'Best of 3', true),
('BO4', 'Best of 4', false),
('BO5', 'Best of 5', false);

INSERT INTO "tournament_registration_statuses" ("code", "label", "is_default") VALUES
('INVITED', 'Invité', false),
('PENDING', 'En attente de validation', true),
('ACCEPTED', 'Inscrit & Validé', false),
('REFUSED', 'Refusé', false);

INSERT INTO "match_statuses" ("code", "label", "is_default") VALUES
('PENDING', 'En attente', true),
('READY', 'Prêt à jouer', false),
('LIVE', 'Match en cours', false),
('COMPLETED', 'Terminé', false),
('CANCELLED', 'Annulé', false),
('DISPUTED', 'En litige', false);

INSERT INTO "match_media_types" ("code", "label", "is_default") VALUES
('SCREENSHOT', 'Capture d écran', true),
('DEMO_REPLAY', 'Fichier DÉMO / Replay', false),
('VIDEO', 'Extrait Vidéo', false);

INSERT INTO "veto_actions" ("code", "label", "is_default") VALUES
('BAN', 'Bannissement', true),
('PICK', 'Sélection', false),
('DECIDER', 'Carte Décisive (Decider)', false);

INSERT INTO "dispute_statuses" ("code", "label", "is_default") VALUES
('OPEN', 'Litige Ouvert', true),
('IN_REVIEW', 'En cours d examen', false),
('RESOLVED', 'Résolu', false),
('REJECTED', 'Classé sans suite', false);

INSERT INTO "overlay_types" ("code", "label", "is_default") VALUES
('SCOREBOARD', 'Bandeau de Score', true),
('MATCH_INFO', 'Fiche d affichage Match', false),
('VETO_PHASE', 'Phase de Pick & Ban', false),
('BRACKET', 'Arbre de Tournoi', false),
('STARTING_SOON', 'Écran d attente', false),
('SCHEDULE', 'Planning du jour', false);

INSERT INTO "invitation_target_types" ("code", "label", "is_default") VALUES
('CLUB', 'Club Esports', true),
('ROSTER', 'Roster / Équipe', false),
('SQUAD', 'Escouade / LFG', false);

-- 2. UTILISATEURS & COMPTES DE JEUX

INSERT INTO "users" ("id", "email", "display_name", "created_at", "updated_at") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'alex.pro@hubgamers.io', 'ScreaM_V', NOW() - INTERVAL '60 days', NOW() - INTERVAL '5 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'julien.m@hubgamers.io', 'ZywOo_Fan', NOW() - INTERVAL '55 days', NOW() - INTERVAL '2 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'sara.k@hubgamers.io', ' Valkyrie_K', NOW() - INTERVAL '50 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'lucas.d@hubgamers.io', 'Shadow_N1', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'chloe.b@hubgamers.io', 'Chlo_Apex', NOW() - INTERVAL '40 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'thomas.r@hubgamers.io', 'Tom_Caster', NOW() - INTERVAL '35 days', NOW() - INTERVAL '1 day'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'maxime.p@hubgamers.io', 'Max_Admin', NOW() - INTERVAL '30 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'mathieu.l@hubgamers.io', 'Mat_RL', NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'elena.g@hubgamers.io', 'Elena_LoL', NOW() - INTERVAL '20 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a1a', 'hugo.v@hubgamers.io', 'Hugo_Sniper', NOW() - INTERVAL '15 days', NOW());

INSERT INTO "user_game_accounts" ("id", "user_id", "game", "in_game_name", "game_user_id", "verified", "created_at", "updated_at") VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Valorant', 'ScreaM#EUW', 'RIOT-88239102', true, NOW() - INTERVAL '59 days', NOW()),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CS2', 'ScreaM_Official', '76561197960287930', true, NOW() - INTERVAL '58 days', NOW()),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Counter-Strike 2', 'ZywOo#2024', '76561198012345678', true, NOW() - INTERVAL '54 days', NOW()),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Valorant', 'Valkyrie#EUW', 'RIOT-19283746', true, NOW() - INTERVAL '49 days', NOW()),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'League of Legends', 'ShadowKing#EUW', 'RIOT-99283100', true, NOW() - INTERVAL '44 days', NOW()),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Apex Legends', 'ChloApex_TTV', 'APEX-443322', true, NOW() - INTERVAL '39 days', NOW()),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Rocket League', 'Mat_RL_Pro', 'EPIC-88371920', false, NOW() - INTERVAL '24 days', NOW()),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'League of Legends', 'ElenaMid#EUW', 'RIOT-33441122', true, NOW() - INTERVAL '19 days', NOW());

-- 3. CLUBS & ROSTERS (ÉQUIPES)

INSERT INTO "clubs" ("id", "name", "description", "slug", "recruit_open", "created_at", "updated_at") VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Karmine Corp Academy', 'Club Esport compétitif axé sur la jeunesse et la formation.', 'kc-academy', true, NOW() - INTERVAL '50 days', NOW()),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'Vitality Rising', 'Structure française majeure à la recherche de nouveaux talents.', 'vitality-rising', true, NOW() - INTERVAL '45 days', NOW()),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'Gentle Mates Esport', 'Structure multigaming engagée dans la scène communautaire.', 'gentle-mates', false, NOW() - INTERVAL '40 days', NOW());

INSERT INTO "clubs_members" ("user_id", "club_id", "role_code", "created_at", "updated_at") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'ADMIN', NOW() - INTERVAL '50 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'USER', NOW() - INTERVAL '48 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'ADMIN', NOW() - INTERVAL '45 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'USER', NOW() - INTERVAL '42 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'ADMIN', NOW() - INTERVAL '40 days', NOW());

INSERT INTO "rosters" ("id", "name", "slug", "platform", "game", "created_at", "updated_at") VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'KCorp Valorant Main', 'kcorp-valorant-main', 'PC', 'Valorant', NOW() - INTERVAL '48 days', NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 'Vitality CS2 Roster', 'vitality-cs2-roster', 'PC', 'Counter-Strike 2', NOW() - INTERVAL '43 days', NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 'Gentle Mates LoL', 'gentle-mates-lol', 'PC', 'League of Legends', NOW() - INTERVAL '38 days', NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'Mix Fraggerz Squad', 'mix-fraggerz-squad', 'PC', 'Valorant', NOW() - INTERVAL '30 days', NOW());

INSERT INTO "rosters_members" ("user_id", "roster_id", "role_code", "created_at", "updated_at") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'CAPTAIN', NOW() - INTERVAL '48 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'PLAYER', NOW() - INTERVAL '48 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a1a', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'PLAYER', NOW() - INTERVAL '40 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 'CAPTAIN', NOW() - INTERVAL '43 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 'CAPTAIN', NOW() - INTERVAL '38 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 'PLAYER', NOW() - INTERVAL '35 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'CAPTAIN', NOW() - INTERVAL '30 days', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'PLAYER', NOW() - INTERVAL '29 days', NOW());

-- 4. SQUADS (LFG / CASUAL)

INSERT INTO "squads" ("id", "name", "type_code", "game", "platform", "nb_places", "micro_required", "level", "role_searched", "created_at", "updated_at") VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Rush Ascendant / Immo', 'RANKED', 'Valorant', 'PC', 2, true, 'Immortal 1+', 'Controller / Duelist', NOW() - INTERVAL '2 days', NOW()),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', 'Chill Premier Tonight', 'CASUAL', 'Counter-Strike 2', 'PC', 3, true, 'Gold Nova / AK', 'Tout profil', NOW() - INTERVAL '1 day', NOW()),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13', 'Scrim BO3 20h00', 'SCRIM', 'Valorant', 'PC', 5, true, 'Diamant +', 'Roster complet requis', NOW() - INTERVAL '5 hours', NOW());

INSERT INTO "squads_members" ("user_id", "squad_id", "role_code") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'OWNER'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'PLAYER'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', 'OWNER'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13', 'OWNER');

-- 5. SPONSORS, TOURNOIS, PRIZES & MEMBRES

INSERT INTO "sponsors" ("id", "name", "logo_url", "website_url", "created_at") VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'Logitech G', 'https://cdn.hubgamers.io/sponsors/logitech.png', 'https://www.logitechg.com', NOW() - INTERVAL '100 days'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'Red Bull', 'https://cdn.hubgamers.io/sponsors/redbull.png', 'https://www.redbull.com/esports', NOW() - INTERVAL '100 days'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e13', 'AMD Gaming', 'https://cdn.hubgamers.io/sponsors/amd.png', 'https://www.amd.com', NOW() - INTERVAL '90 days');

INSERT INTO "tournaments" (
"id", "name", "slug", "game", "status_code", "format", "platform",
"cashprize", "prix_entree", "nb_rosters", "checkin_enabled",
"checkin_start_at", "checkin_end_at", "start_at", "end_at",
"registration_start_at", "registration_end_at", "created_at", "updated_at"
) VALUES (
'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11',
'HubGamers Valorant Championship #1',
'hubgamers-valorant-championship-1',
'Valorant',
'ONGOING',
'5v5',
'PC',
1500.00,
'Gratuit',
16,
true,
NOW() - INTERVAL '3 hours',
NOW() - INTERVAL '1 hour',
NOW() - INTERVAL '30 minutes',
NOW() + INTERVAL '1 day',
NOW() - INTERVAL '10 days',
NOW() - INTERVAL '4 hours',
NOW() - INTERVAL '15 days',
NOW()
);

INSERT INTO "tournament_prizes" ("id", "tournament_id", "position", "amount", "percentage", "created_at") VALUES
(gen_random_uuid(), 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 1, 1000.00, 66.67, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 2, 350.00, 23.33, NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 3, 150.00, 10.00, NOW() - INTERVAL '15 days');

INSERT INTO "tournament_sponsors" ("tournament_id", "sponsor_id", "tier") VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'Gold Partner'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'Title Sponsor');

INSERT INTO "tournaments_members" ("user_id", "tournament_id", "role_code", "created_at") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'OWNER', NOW() - INTERVAL '15 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'CASTER', NOW() - INTERVAL '10 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'ARBITRE', NOW() - INTERVAL '10 days');

-- 6. PHASES DE TOURNOI & INSCRIPTIONS

INSERT INTO "tournaments_stages" ("id", "tournament_id", "name", "type_code", "status_code", "nb_team", "bo_code", "created_at", "updated_at") VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'Arbre d Élimination Directe', 'SIMPLET_BRACKET', 'ONGOING', 8, 'BO3', NOW() - INTERVAL '15 days', NOW());

INSERT INTO "tournaments_registrations" ("roster_id", "tournament_id", "status_code", "checked_in", "checked_in_at", "created_at", "updated_at") VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'ACCEPTED', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '8 days', NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'ACCEPTED', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '7 days', NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'ACCEPTED', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '6 days', NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'ACCEPTED', true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '5 days', NOW());

-- 7. MATCHS, VETOS, JEUX ET MÉDIAS

INSERT INTO "tournaments_matches" (
"id", "stage_id", "roster1_id", "roster2_id", "winner_roster_id",
"status_code", "round_number", "roster1_checked_in", "roster2_checked_in",
"scheduled_at", "started_at", "ended_at", "created_at", "updated_at"
) VALUES (
'20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', NULL,
'LIVE', 1, true, true,
NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '20 minutes', NULL, NOW() - INTERVAL '2 hours', NOW()
);

-- Vetos de cartes pour le match BO3
INSERT INTO "match_map_vetos" ("id", "match_id", "roster_id", "map_name", "action_code", "order_number", "created_at") VALUES
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Ascent', 'BAN', 1, NOW() - INTERVAL '25 minutes'),
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'Bind', 'BAN', 2, NOW() - INTERVAL '24 minutes'),
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Haven', 'PICK', 3, NOW() - INTERVAL '23 minutes'),
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14', 'Lotus', 'PICK', 4, NOW() - INTERVAL '22 minutes'),
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Sunset', 'DECIDER', 5, NOW() - INTERVAL '21 minutes');

-- Détail des cartes jouées
INSERT INTO "tournaments_match_games" ("id", "match_id", "game_number", "map_name", "roster1_score", "roster2_score", "winner_roster_id", "created_at", "updated_at") VALUES
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 1, 'Haven', 13, 9, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '5 minutes'),
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 2, 'Lotus', 4, 6, NULL, NOW() - INTERVAL '3 minutes', NOW());

-- Médias uploadés (preuve de score / screenshot)
INSERT INTO "match_media" ("id", "match_id", "uploaded_by_user_id", "media_type_code", "url", "created_at") VALUES
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SCREENSHOT', 'https://cdn.hubgamers.io/matches/1/map1_victory.png', NOW() - INTERVAL '4 minutes');

-- 8. ARBITRAGE & LITIGES (DISPUTES)

INSERT INTO "match_arbiters" ("match_id", "user_id", "assigned_at") VALUES
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW() - INTERVAL '30 minutes');

INSERT INTO "match_disputes" (
"id", "match_id", "opened_by_user_id", "handled_by_user_id",
"reason", "status_code", "resolution_notes", "created_at", "updated_at"
) VALUES (
gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
'Contestation du temps de pause tactique pris par Roster 1 au Round 8 de la Map 1.',
'IN_REVIEW', NULL,
NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '10 minutes'
);

-- 9. WEBRADIO / STREAMS & OVERLAYS STUDIO

INSERT INTO "tournament_streams" ("id", "tournament_id", "match_id", "platform", "channel_name", "stream_url", "language", "is_official", "created_at", "updated_at") VALUES
(gen_random_uuid(), 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'Twitch', 'hubgamers_fr', 'https://twitch.tv/hubgamers_fr', 'fr', true, NOW() - INTERVAL '1 hour', NOW());

INSERT INTO "studios" ("id", "owner_user_id", "tournament_id", "active_match_id", "name", "created_at", "updated_at") VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380311', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', 'Studio Principal Fr', NOW() - INTERVAL '2 hours', NOW());

INSERT INTO "studio_overlays" ("id", "studio_id", "type_code", "access_token", "is_enabled", "created_at", "updated_at") VALUES
(gen_random_uuid(), '30eebc99-9c0b-4ef8-bb6d-6bb9bd380311', 'SCOREBOARD', 'tk_live_score_882a9f02c', true, NOW() - INTERVAL '2 hours', NOW()),
(gen_random_uuid(), '30eebc99-9c0b-4ef8-bb6d-6bb9bd380311', 'VETO_PHASE', 'tk_live_veto_112c330aa', true, NOW() - INTERVAL '2 hours', NOW()),
(gen_random_uuid(), '30eebc99-9c0b-4ef8-bb6d-6bb9bd380311', 'BRACKET', 'tk_live_bracket_776100ff', true, NOW() - INTERVAL '2 hours', NOW());

INSERT INTO "studio_scenes_config" ("id", "studio_id", "primary_color", "secondary_color", "font_family", "show_sponsors", "show_casters", "custom_css", "updated_at") VALUES
(gen_random_uuid(), '30eebc99-9c0b-4ef8-bb6d-6bb9bd380311', '#00F0FF', '#FF0055', 'Inter', true, true, '.overlay-header { text-transform: uppercase; }', NOW());

-- 10. INVITATIONS & NOTIFICATIONS

INSERT INTO "invitations" ("id", "code", "inviter_id", "target_type_code", "target_id", "max_uses", "uses_count", "expires_at", "created_at") VALUES
(gen_random_uuid(), 'INV-KC-2026', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CLUB', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 10, 2, NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'INV-ROSTER-VAL', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ROSTER', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 1, 0, NOW() + INTERVAL '1 day', NOW() - INTERVAL '5 hours');

INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "read_at", "created_at") VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Match en direct !', 'Votre match contre Mix Fraggerz Squad a commencé.', 'MATCH_START', NOW() - INTERVAL '18 minutes', NOW() - INTERVAL '20 minutes'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Litige en cours', 'Un arbitre a pris en charge votre réclamation.', 'DISPUTE_UPDATE', NULL, NOW() - INTERVAL '10 minutes');

COMMIT;