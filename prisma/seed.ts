import { PrismaClient, SquadMemberStatus } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"

// Charger explicitement le .env si nécessaire
dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })
async function main() {
  console.log("🧹 Nettoyage de la base de données...")
  // Ordre inverse des dépendances pour éviter les erreurs de contraintes FK
  await prisma.match_disputes.deleteMany()
  await prisma.match_map_vetos.deleteMany()
  await prisma.match_media.deleteMany()
  await prisma.match_arbiters.deleteMany()
  await prisma.tournaments_match_games.deleteMany()
  await prisma.tournaments_matches.deleteMany()
  await prisma.tournaments_registrations.deleteMany()
  await prisma.tournaments_stages.deleteMany()
  await prisma.tournament_prizes.deleteMany()
  await prisma.tournament_sponsors.deleteMany()
  await prisma.tournament_streams.deleteMany()
  await prisma.tournaments.deleteMany()
  await prisma.games.deleteMany()
  
  await prisma.studio_overlays.deleteMany()
  await prisma.studio_scenes_config.deleteMany()
  await prisma.studios.deleteMany()

  await prisma.squads_members.deleteMany()
  await prisma.squads.deleteMany()
  await prisma.rosters_members.deleteMany()
  await prisma.rosters.deleteMany()
  await prisma.clubs_members.deleteMany()
  await prisma.clubs.deleteMany()
  await prisma.invitations.deleteMany()
  await prisma.notifications.deleteMany()
  await prisma.user_game_accounts.deleteMany()
  await prisma.users.deleteMany()

  console.log("📦 Insertion des tables de référence (Configurations)...")

  // Références statiques
  await prisma.club_roles.createMany({
    data: [
      { code: "OWNER", label: "Propriétaire", is_default: true },
      { code: "MANAGER", label: "Manager Général", is_default: false },
      { code: "COACH", label: "Entraîneur", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.team_roles.createMany({
    data: [
      { code: "CAPTAIN", label: "Capitaine", is_default: true },
      { code: "PLAYER", label: "Joueur Titulaire", is_default: false },
      { code: "SUB", label: "Remplaçant", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.squad_types.createMany({
    data: [
      { code: "RANKED", label: "Classement / Ranked", is_default: true },
      { code: "FUN", label: "Détente / Casual", is_default: false },
      { code: "TRAINING", label: "Entraînement Scrim", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.squad_member_roles.createMany({
    data: [
      { code: "LEADER", label: "Leader d'escouade", is_default: true },
      { code: "MEMBER", label: "Membre", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.tournament_statuses.createMany({
    data: [
      { code: "UPCOMING", label: "À venir", is_default: true },
      { code: "REGISTRATION", label: "Inscriptions ouvertes", is_default: false },
      { code: "ONGOING", label: "En cours", is_default: false },
      { code: "FINISHED", label: "Terminé", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.tournament_member_roles.createMany({
    data: [
      { code: "ADMIN", label: "Administrateur Tournoi", is_default: true },
      { code: "CASTER", label: "Casteur / Streamer", is_default: false },
      { code: "ARBITER", label: "Arbitre", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.tournament_stage_types.createMany({
    data: [
      { code: "BRACKET", label: "Arbre à élimination", is_default: true },
      { code: "ROUND_ROBIN", label: "Phase de poules", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.tournament_stage_statuses.createMany({
    data: [
      { code: "PENDING", label: "En attente", is_default: true },
      { code: "RUNNING", label: "En cours", is_default: false },
      { code: "COMPLETED", label: "Terminé", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.bo_options.createMany({
    data: [
      { code: "BO1", label: "Best of 1", is_default: true },
      { code: "BO3", label: "Best of 3", is_default: false },
      { code: "BO5", label: "Best of 5", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.tournament_registration_statuses.createMany({
    data: [
      { code: "CONFIRMED", label: "Confirmé", is_default: true },
      { code: "PENDING", label: "En attente de validation", is_default: false },
      { code: "REJECTED", label: "Refusé", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.match_statuses.createMany({
    data: [
      { code: "SCHEDULED", label: "Planifié", is_default: true },
      { code: "LIVE", label: "En direct", is_default: false },
      { code: "COMPLETED", label: "Terminé", is_default: false },
      { code: "DISPUTED", label: "Litige en cours", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.match_media_types.createMany({
    data: [
      { code: "SCREENSHOT", label: "Capture d'écran de fin", is_default: true },
      { code: "DEMO", label: "Fichier démo / Replay", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.veto_actions.createMany({
    data: [
      { code: "BAN", label: "Ban de carte", is_default: true },
      { code: "PICK", label: "Choix de carte", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.dispute_statuses.createMany({
    data: [
      { code: "OPEN", label: "Ouvert", is_default: true },
      { code: "RESOLVED", label: "Résolu", is_default: false },
      { code: "CLOSED", label: "Fermé", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.overlay_types.createMany({
    data: [
      { code: "SCOREBOARD", label: "Tableau des scores overlay", is_default: true },
      { code: "BRACKET", label: "Arbre du tournoi widget", is_default: false },
      { code: "VETO", label: "Écran de Veto en direct", is_default: false },
    ],
    skipDuplicates: true,
  })

  await prisma.invitation_target_types.createMany({
    data: [
      { code: "CLUB", label: "Invitation Club", is_default: true },
      { code: "ROSTER", label: "Invitation Roster", is_default: false },
      { code: "SQUAD", label: "Invitation Escouade", is_default: false },
    ],
    skipDuplicates: true,
  })

  console.log("🎮 Insertion des Jeux (Games)...")
  const gamesData = [
    { name: "Valorant" },
    { name: "Counter-Strike 2" },
    { name: "League of Legends" },
    { name: "Rocket League" },
    { name: "Apex Legends" },
    { name: "Fortnite" },
  ]
  
  const createdGames = []
  for (const g of gamesData) {
    const game = await prisma.games.create({ data: g })
    createdGames.push(game)
  }

  console.log("👥 Génération massive des Utilisateurs (50 utilisateurs)...")
  const users = []
  for (let i = 1; i <= 50; i++) {
    const user = await prisma.users.create({
      data: {
        email: `gamer.pro.${i}@hubgamers-test.com`,
        display_name: `ProGamer_${i}x`,
      },
    })
    users.push(user)
  }

  console.log("🔗 Liaison des comptes de jeux...")
  for (const user of users) {
    const randomGame = createdGames[Math.floor(Math.random() * createdGames.length)].name
    await prisma.user_game_accounts.create({
      data: {
        user_id: user.id,
        game: randomGame,
        in_game_name: `${user.display_name}_${randomGame.slice(0, 3)}`,
        game_user_id: `ID-${Math.floor(Math.random() * 900000 + 100000)}`,
        verified: true,
      },
    })
  }

  console.log("🛡️ Création des Clubs Esport & Rostières...")
  const clubs = []
  for (let i = 1; i <= 10; i++) {
    const club = await prisma.clubs.create({
      data: {
        name: `CyberEsport Team ${i}`,
        slug: `cyber-esport-team-${i}`,
        description: `Structure professionnelle eSport #${i} axée sur les compétitions majeures.`,
        recruit_open: true,
      },
    })
    clubs.push(club)

    // Membres du club
    await prisma.clubs_members.create({
      data: {
        user_id: users[i - 1].id,
        club_id: club.id,
        role_code: "OWNER",
      },
    })

    // Roster associé au club
    const roster = await prisma.rosters.create({
      data: {
        name: `Lineup ${club.name}`,
        slug: `lineup-${club.slug}`,
        platform: "PC",
        game: createdGames[i % createdGames.length].name,
      },
    })

    await prisma.rosters_members.create({
      data: {
        user_id: users[i - 1].id,
        roster_id: roster.id,
        role_code: "CAPTAIN",
      },
    })
  }

  console.log("🏆 Création des Tournois Intensifs...")
  const sponsors = []
  for (let i = 1; i <= 5; i++) {
    const sponsor = await prisma.sponsors.create({
      data: {
        name: `Sponsor Tech ${i}G`,
        logo_url: `https://hubgamers.test/logos/sponsor-${i}.png`,
        website_url: `https://sponsor-${i}-gaming.com`,
      },
    })
    sponsors.push(sponsor)
  }

  const tournaments = []
  for (let i = 1; i <= 8; i++) {
    const randomGame = createdGames[Math.floor(Math.random() * createdGames.length)]
    const tournament = await prisma.tournaments.create({
      data: {
        name: `Major Championship S${i}: ${randomGame.name}`,
        slug: `major-championship-s${i}-${randomGame.name.toLowerCase().replace(/\s+/g, '-')}`,
        game_id: randomGame.id,
        status_code: i % 2 === 0 ? "ONGOING" : "REGISTRATION",
        format: "Single Elimination",
        platform: "PC",
        cashprize: 2500.00 * i,
        prix_entree: "Gratuit",
        nb_rosters: 16,
        checkin_enabled: true,
        start_at: new Date(Date.now() + 86400000 * i),
        end_at: new Date(Date.now() + 86400000 * (i + 3)),
      },
    })
    tournaments.push(tournament)

    // Ajouter des prix
    await prisma.tournament_prizes.createMany({
      data: [
        { tournament_id: tournament.id, position: 1, amount: 1500.00 * i, percentage: 60 },
        { tournament_id: tournament.id, position: 2, amount: 750.00 * i, percentage: 30 },
        { tournament_id: tournament.id, position: 3, amount: 250.00 * i, percentage: 10 },
      ],
    })

    // Lier un sponsor
    await prisma.tournament_sponsors.create({
      data: {
        tournament_id: tournament.id,
        sponsor_id: sponsors[i % sponsors.length].id,
        tier: "Platinium",
      },
    })

    // Créer des stages / phases de tournoi
    const stage = await prisma.tournaments_stages.create({
      data: {
        tournament_id: tournament.id,
        name: "Playoffs Arbre Final",
        type_code: "BRACKET",
        status_code: "RUNNING",
        nb_team: 8,
        bo_code: "BO3",
      },
    })

    // Enregistrer quelques rosters dans le tournoi
    const allRosters = await prisma.rosters.findMany({ take: 4 })
    for (const rost of allRosters) {
      await prisma.tournaments_registrations.create({
        data: {
          roster_id: rost.id,
          tournament_id: tournament.id,
          status_code: "CONFIRMED",
          checked_in: true,
        },
      })

      // Création d'un match test pour le tournoi
      const match = await prisma.tournaments_matches.create({
        data: {
          stage_id: stage.id,
          roster1_id: allRosters[0].id,
          roster2_id: allRosters[1].id,
          status_code: "LIVE",
          round_number: 1,
          roster1_checked_in: true,
          roster2_checked_in: true,
          scheduled_at: new Date(),
          started_at: new Date(),
        },
      })

      // Sous-parties / Games du match
      await prisma.tournaments_match_games.createMany({
        data: [
          {
            match_id: match.id,
            game_number: 1,
            map_name: "Ascent / Dust2",
            roster1_score: 13,
            roster2_score: 9,
            winner_roster_id: allRosters[0].id,
          },
          {
            match_id: match.id,
            game_number: 2,
            map_name: "Bind / Mirage",
            roster1_score: 8,
            roster2_score: 13,
            winner_roster_id: allRosters[1].id,
          },
        ],
      })

      // Vétos de map
      await prisma.match_map_vetos.create({
        data: {
          match_id: match.id,
          roster_id: allRosters[0].id,
          map_name: "Fracture",
          action_code: "BAN",
          order_number: 1,
        },
      })

      // Litige de test
      await prisma.match_disputes.create({
        data: {
          match_id: match.id,
          opened_by_user_id: users[0].id,
          reason: "Problème de lag serveur persistant sur la map 2.",
          status_code: "OPEN",
        },
      })
    }
  }

  console.log("📺 Configuration des Studios de Diffusion OBS & Overlays...")
  for (let i = 0; i < 3; i++) {
    const studio = await prisma.studios.create({
      data: {
        owner_user_id: users[i].id,
        name: `Studio HubCast #${i + 1}`,
        tournament_id: tournaments[i].id,
      },
    })

    await prisma.studio_scenes_config.create({
      data: {
        studio_id: studio.id,
        primary_color: "#00F0FF",
        secondary_color: "#8B5CF6",
        font_family: "Inter",
        show_sponsors: true,
        show_casters: true,
      },
    })

    await prisma.studio_overlays.create({
      data: {
        studio_id: studio.id,
        type_code: "SCOREBOARD",
        access_token: `token-secret-obs-${i}-${Math.random().toString(36).substring(7)}`,
        is_enabled: true,
      },
    })

    await prisma.tournament_streams.create({
      data: {
        tournament_id: tournaments[i].id,
        platform: "Twitch",
        channel_name: `hubgamers_tv_${i + 1}`,
        stream_url: `https://twitch.tv/hubgamers_tv_${i + 1}`,
        language: "fr",
        is_official: true,
      },
    })
  }

  console.log("🎯 Génération des Escouades LFG & Notifications...")
  for (let i = 0; i < 10; i++) {
    const squad = await prisma.squads.create({
      data: {
        name: `LFG Chill Squad #${i + 1}`,
        type_code: "RANKED",
        game: createdGames[i % createdGames.length].name,
        platform: "PC",
        nb_places: 5,
        micro_required: true,
        level: "Diamant / Global",
        role_searched: "Support / Entry",
      },
    })

    await prisma.squads_members.create({
      data: {
        user_id: users[i + 5].id,
        squad_id: squad.id,
        role_code: "LEADER",
        status: SquadMemberStatus.JOINED,
      },
    })

    // Notifications de test
    await prisma.notifications.create({
      data: {
        user_id: users[i].id,
        title: "Bienvenue sur HubGamers !",
        message: "Votre compte est configuré avec succès. Prêt pour le tournoi ?",
        type: "SYSTEM",
      },
    })
  }

  console.log("✨ Données de test lourdes injectées avec succès ! Le SaaS est prêt à être piloté à plein régime.")
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })