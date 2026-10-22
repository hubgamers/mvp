# Backlog MVP HubGamers

Ce backlog décrit l’écart entre l’application actuelle et un MVP utilisable de bout en bout. Les éléments marqués **En place** ont une première implémentation dans le dépôt ; ils restent à valider dans le parcours complet avant la mise en production. Les éléments **À faire** ne sont pas considérés comme livrés.

## État actuel constaté

- **En place — Comptes :** inscription, connexion et déconnexion avec Supabase Auth.
- **En place — Structures et équipes :** écrans et actions de création/consultation, membres et rôles de base.
- **En place — Tournois :** création, consultation dans le tableau de bord et modification des principaux paramètres.
- **Partiel — Invitations :** invitation d’équipes et de membres de l’organisation, liste des invitations reçues, acceptation/refus et inscriptions d’équipes à l’acceptation. Les droits, les cas limites et le parcours d’inscription publique restent à compléter.
- **Partiel — Compétition :** affichage d’un arbre et d’une page de match ; saisie de scores possible par certaines personnes autorisées. La création/configuration de l’arbre, la validation des résultats et l’avancement automatique des équipes ne sont pas livrés.
- **Partiel — Chats :** chat par match et liste de chats dans l’espace connecté. Les notifications, l’expérience de suivi et les accès staff sont à valider.
- **En place — Studio :** projets liés à un tournoi, scènes et réglages de thème de base. Les modèles d’overlays prêts à l’emploi et leur publication ne sont pas livrés.
- **À faire — Abonnements :** la page Facturation est un écran d’attente ; aucune intégration Stripe n’est présente.
- **À faire — Présence publique :** la page d’accueil est encore celle du template Next.js ; aucune page publique dédiée à un tournoi n’est présente.
- **À faire — Notifications :** pas de centre de notifications identifié.
- **À faire — Validation de livraison :** aucun parcours automatisé de tests dédié ni critère de mise en production documenté n’a été identifié.

## P0 — Parcours indispensable pour lancer un tournoi

### 1. Accès, rôles et invitations

- [OK] **Centraliser les règles d’autorisation** pour les tournois et les appliquer aux pages, aux listes et aux Server Actions : créateur, administrateur de la structure organisatrice, ADMIN et ARBITRE.
- [ ] **Appliquer les capacités propres à chaque rôle :** ADMIN peut gérer le tournoi et son équipe ; ARBITRE peut accéder aux matchs assignés/au périmètre prévu et traiter les scores ou litiges, sans pouvoir modifier les paramètres du tournoi ni sa facturation.
- [ ] **Réserver la modification du tournoi aux personnes habilitées**, et non uniquement à son créateur ; contrôler également les actions de gestion du tournoi côté serveur.
- [ ] **Compléter la gestion des membres du tournoi :** consulter les invitations en attente, retirer un membre et modifier son rôle avec contrôle d’autorisation.
- [ ] **Fiabiliser les invitations aux équipes :** droits de l’organisateur, destinataire propriétaire/capitaine attendu, doublons, expiration, tournoi fermé, équipe supprimée ou déjà inscrite ; rendre les erreurs visibles et conserver un état cohérent si l’e-mail échoue.
- [ ] **Compléter les invitations de staff :** vérifier le rôle à l’acceptation, les doublons/cas d’auto-invitation, les e-mails, et l’accès effectif aux chats et matchs selon le rôle.
- [ ] **Vérifier les invitations d’équipe, de structure et de tournoi de bout en bout**, y compris leur affichage, leur acceptation/refus, leur expiration et les droits obtenus après réponse.

**Critère de fin :** aucun rôle ne peut effectuer une action interdite en appelant directement une Server Action ou une URL ; les parcours légitimes restent accessibles après invitation.

### 2. Page publique et inscription au tournoi

- [OK] **Remplacer la page d’accueil de démonstration** par une page d’accueil HubGamers avec accès clair à la découverte des tournois et à la connexion/inscription.
- [ ] **Créer une page publique de tournoi par slug** (sans connexion) avec jeu, plateforme, format, dates/fuseau, règlement, récompenses, statut, équipes inscrites et arbre lorsque disponible.
- [ ] **Définir le comportement des tournois privés** : non listés/non accessibles aux personnes non autorisées, même en connaissant l’URL.
- [ ] **Compléter le flux d’inscription des équipes** : inscription depuis la page publique ou réponse à une invitation, selon le mode choisi par l’organisateur ; vérifier jeu, plateforme, taille du roster, dates, statut, capacité maximale et absence de doublon côté serveur.
- [ ] **Gérer le cycle d’inscription** (ouverture, fermeture, limites d’équipes et états d’inscription) avec des messages compréhensibles et des mises à jour cohérentes de l’interface.
- [ ] **Définir et livrer le check-in** si le statut CHECK_IN reste exposé dans le produit : fenêtre, action de confirmation, états et effet sur les équipes non confirmées.

**Critère de fin :** une personne non connectée peut découvrir un tournoi public ; une équipe éligible peut s’inscrire ou accepter une invitation ; les règles de visibilité et d’éligibilité sont appliquées côté serveur.

### 3. Génération et gestion de l’arbre

- [ ] **Créer le format MVP de compétition** (format pris en charge, nombre d’équipes, gestion des nombres non puissances de deux et exemptions) et ses règles de génération.
- [ ] **Générer les tours et matchs** à partir des équipes inscrites/validées, de manière transactionnelle et sans doublons ; empêcher une génération invalide ou une régénération destructive.
- [ ] **Permettre à l’organisateur de placer/réordonner manuellement les équipes au premier tour**, avec validation des places, absence de doublons et prévisualisation avant publication.
- [ ] **Définir le verrouillage de l’arbre** : équipes et résultats déjà engagés ne doivent pas être déplacés silencieusement ; prévoir les changements autorisés et leur journalisation.
- [ ] **Propager le gagnant d’un match vers le tour suivant** et traiter les exemptions jusqu’au vainqueur final.
- [ ] **Relier les contrôles d’administration à la page de l’arbre** et n’autoriser ces opérations qu’aux rôles concernés.

**Critère de fin :** un tournoi avec les équipes attendues produit un arbre cohérent, consultable publiquement si le tournoi l’est, et les résultats font avancer les équipes sans intervention manuelle.

### 4. Matchs, scores et litiges

- [ ] **Définir le workflow d’un match** et les transitions de statut autorisées (à venir, prêt/en direct, résultat à confirmer, terminé, contesté, annulé).
- [ ] **Permettre aux capitaines/managers de déclarer un résultat** pour leur équipe sans pouvoir valider eux-mêmes un résultat adverse.
- [ ] **Mettre en place la confirmation par l’adversaire** ; si aucun désaccord n’est signalé dans les 5 minutes suivant la déclaration, valider automatiquement le résultat. Le délai doit être mesuré côté serveur et traité par un mécanisme fiable (tâche planifiée/cron), pas uniquement par un minuteur navigateur.
- [ ] **Permettre de contester un résultat** avec motif, empêcher l’avancement de l’arbre tant que le litige est ouvert et notifier un ADMIN/ARBITRE habilité.
- [ ] **Permettre à l’ADMIN/ARBITRE de trancher un litige** et conserver l’auteur, la décision et les horodatages.
- [ ] **Valider les règles de score** selon le format (égalité, manches, meilleur de N, score final) avant de terminer un match.
- [ ] **Propager les scores et statuts validés** dans l’arbre, l’historique de l’équipe et la page publique.
- [ ] **Compléter la page de match d’équipe** : adversaires, roster, règlement, déclaration/confirmation de score, litige, chat et accès rapide pour demander l’intervention d’un ADMIN/ARBITRE.
- [ ] **Vérifier l’accès aux matchs et aux chats** pour les équipes participantes, le créateur, les ADMIN et les ARBITRE ; un utilisateur extérieur ne doit ni lire ni écrire.

**Critère de fin :** chaque match peut être joué, déclaré, confirmé automatiquement ou contesté puis arbitré ; seul un résultat validé fait progresser l’arbre.

### 5. Chats et notifications

- [ ] **Finaliser la liste des chats de match** pour les participants et le staff autorisé ; afficher le dernier message, les matchs concernés et les états pertinents sans exposer les matchs hors périmètre.
- [ ] **Rendre les nouveaux messages visibles sans rechargement manuel** (temps réel ou rafraîchissement fiable) et traiter les erreurs de synchronisation/envoi sans perdre le message saisi.
- [ ] **Créer un centre de notifications** avec état lu/non lu et accès à l’action concernée.
- [ ] **Générer les notifications MVP** : invitation reçue, message/réponse attendue sur un match, score à confirmer, litige ouvert/décision rendue, match terminé ou remporté/perdu.
- [ ] **Ajouter les indicateurs de non-lu** dans la navigation et permettre de marquer une notification comme lue.
- [ ] **Définir les notifications par e-mail** réellement nécessaires au lancement et vérifier les erreurs d’envoi et la configuration de production.

**Critère de fin :** chaque événement important conduit les bons utilisateurs vers la bonne page, sans notification visible par un tiers non autorisé.

## P1 — Fonctionnalités annoncées à terminer

### 6. Historique des équipes

- [ ] **Auditer et corriger l’historique des compétitions** dans la fiche équipe : retrouver toutes les inscriptions pertinentes, nom/statut/dates du tournoi et lien vers le tournoi ; ne pas afficher les inscriptions supprimées ou incohérentes.
- [ ] **Afficher le résultat final de l’équipe** (place/résultat) lorsqu’il est connu et distinguer les tournois à venir, en cours et terminés.
- [ ] **Vérifier les permissions de la fiche équipe** pour les membres et les visiteurs selon la visibilité choisie.

### 7. Abonnements et Stripe

- [ ] **Définir l’offre MVP** (plans, limites et fonctionnalités incluses) avant de créer les prix et produits Stripe.
- [ ] **Créer et configurer les produits/prix Stripe** pour les environnements test et production ; documenter les identifiants requis via variables d’environnement.
- [ ] **Implémenter le démarrage d’abonnement et le portail client**, avec association fiable du client Stripe au compte HubGamers.
- [ ] **Traiter les webhooks Stripe** de façon authentifiée, idempotente et persistante pour synchroniser activation, renouvellement, échec de paiement, annulation et fin d’abonnement.
- [ ] **Remplacer l’écran d’attente Facturation** par le plan courant, son état, la date de renouvellement et les actions de gestion/annulation.
- [ ] **Appliquer les droits et limites de plan côté serveur**, et définir le comportement en cas d’abonnement expiré ou de paiement échoué.
- [ ] **Tester les scénarios de paiement en mode test** avant toute configuration de production.

### 8. Studio et overlays

- [ ] **Créer des templates d’overlays par défaut** (au minimum arbre, match et score) à partir des scènes déjà prises en charge.
- [ ] **Permettre de créer un projet Studio depuis un template** et de modifier ensuite le thème et la disposition sans modifier le template partagé.
- [ ] **Définir la publication et l’accès public aux overlays** : URL/token révocable, scènes activées uniquement, données publiques limitées au tournoi.
- [ ] **Vérifier que l’arbre, le match et les scores d’overlay** reflètent les résultats effectivement validés.

### 9. Interface et cohérence produit

- [ ] **Faire une passe visuelle cohérente sur les pages principales** (accueil, découverte, tournoi, match, équipes, facturation, notifications) avec les composants et le thème shadcn déjà présents.
- [ ] **Uniformiser les états de chargement, erreurs, listes vides et confirmations** ; remplacer les libellés techniques et corriger les incohérences de langue.
- [ ] **Vérifier l’accessibilité et le responsive** des formulaires, onglets, arbres, tableaux/listes et actions critiques.
- [ ] **Retirer les éléments de template et les traces de débogage** visibles ou inutiles avant publication.

## P0 — Fiabilisation et mise en production

- [ ] **Vérifier les migrations et le schéma de base de données** sur une base neuve et une base contenant déjà les données ; confirmer que le dépôt et l’environnement Supabase sont synchronisés.
- [ ] **Contrôler les politiques RLS et l’usage de Prisma/Supabase** pour chaque donnée privée, en particulier invitations, membres, chats, scores, profils et facturation.
- [ ] **Ajouter des tests ciblés** pour les permissions, invitations, inscriptions, génération/avancement d’arbre, résultats/contestation et webhooks ; inclure les refus d’accès.
- [ ] **Exécuter et corriger lint, vérification TypeScript et build de production** ; documenter les commandes réellement utilisables dans le dépôt.
- [ ] **Documenter les variables d’environnement nécessaires** (Supabase, base de données, e-mail, Stripe et tâches planifiées) sans inclure de secrets ; vérifier qu’une configuration manquante échoue explicitement.
- [ ] **Configurer le domaine, HTTPS, e-mails transactionnels et URL de retour** pour les environnements de test et production.
- [ ] **Prévoir logs et suivi des erreurs** pour les inscriptions, génération des arbres, transitions de match, notifications, e-mails et paiements.
- [ ] **Faire une recette manuelle du parcours complet** avec au moins deux équipes et les rôles organisateur, capitaine, ADMIN et ARBITRE.

## Définition de « MVP prêt »

Le MVP est prêt lorsque :

1. un utilisateur peut créer son compte, une équipe et un tournoi ;
2. une équipe peut être invitée ou s’inscrire selon les règles publiques/privées du tournoi ;
3. l’organisateur peut constituer et publier l’arbre, y compris ordonner manuellement le premier tour ;
4. les équipes jouent un match, déclarent et confirment le score, ou ouvrent un litige résolu par le staff ;
5. les résultats validés font avancer l’arbre et sont visibles dans les pages autorisées ;
6. les chats et notifications conduisent les participants et le staff aux actions attendues, sans fuite d’accès ;
7. les fonctionnalités annoncées comme actives (Studio/overlays et abonnements si conservés dans le périmètre de lancement) fonctionnent réellement, ou sont explicitement masquées jusqu’à leur livraison ;
8. les tests, le build et la recette de bout en bout passent sur une configuration proche de la production.
