"use client";

import React, { useState, useMemo } from "react";
import { CurrentYear } from "@/components/current-year";
import {
  Trophy,
  Gamepad2,
  Search,
  Filter,
  Calendar,
  Users,
  Swords,
  ChevronRight,
  Flame,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Coins,
  Tv,
  Globe2,
  ExternalLink,
  SlidersHorizontal,
  X,
  UserCheck,
  Award,
  Circle,
  TrendingUp,
} from "lucide-react";

export interface Tournament {
  id: string;
  title: string;
  slug: string;
  game: {
    name: string;
    code: string;
    color: string;
    badgeBg: string;
  };
  organizer: {
    name: string;
    verified: boolean;
    avatar: string;
  };
  startDate: string;
  startTime: string;
  status: "upcoming" | "ongoing" | "completed";
  format: string; // e.g., "Arbre Élimination Directe (BO3)"
  teamSize: string; // e.g., "5v5", "1v1"
  registeredTeams: number;
  maxTeams: number;
  cashprize: number;
  currency: string;
  bannerUrl: string;
  isFeatured?: boolean;
  platform: string; // PC, Console, Crossplay
  entryFee: string; // Free, 10€, etc.
  region: string;
}

const GAMES_FILTER = [
  { id: "all", label: "Tous les jeux" },
  { id: "valorant", label: "Valorant" },
  { id: "lol", label: "League of Legends" },
  { id: "cs2", label: "Counter-Strike 2" },
  { id: "rl", label: "Rocket League" },
  { id: "apex", label: "Apex Legends" },
  { id: "fc25", label: "EA FC 25" },
];

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: "tourney-1",
    title: "Valorant Radiant Clash Season #4 - Open Qualifier",
    slug: "valorant-radiant-clash-s4",
    game: {
      name: "Valorant",
      code: "valorant",
      color: "#ff4655",
      badgeBg: "bg-red-500/10 text-red-400 border-red-500/30",
    },
    organizer: {
      name: "Mandatory Esport",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80",
    },
    startDate: "28 Oct. 2026",
    startTime: "19:00",
    status: "upcoming",
    format: "Élimination Directe (BO3)",
    teamSize: "5v5",
    registeredTeams: 28,
    maxTeams: 32,
    cashprize: 2500,
    currency: "€",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    isFeatured: true,
    platform: "PC",
    entryFee: "Gratuit",
    region: "EU West",
  },
  {
    id: "tourney-2",
    title: "LoL Hextech Arena - Championship Division",
    slug: "lol-hextech-arena-championship",
    game: {
      name: "League of Legends",
      code: "lol",
      color: "#00a3ff",
      badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    organizer: {
      name: "Karmine Corp Academy",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    startDate: "En cours (Aujourd'hui)",
    startTime: "16:00",
    status: "ongoing",
    format: "Double Élimination & Bracket BO5",
    teamSize: "5v5",
    registeredTeams: 16,
    maxTeams: 16,
    cashprize: 5000,
    currency: "€",
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    isFeatured: true,
    platform: "PC",
    entryFee: "Gratuit",
    region: "Europe",
  },
  {
    id: "tourney-3",
    title: "CS2 Major Community Cup #12",
    slug: "cs2-major-community-cup-12",
    game: {
      name: "Counter-Strike 2",
      code: "cs2",
      color: "#f59e0b",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    organizer: {
      name: "Blast Arena Hub",
      verified: false,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    },
    startDate: "02 Nov. 2026",
    startTime: "20:00",
    status: "upcoming",
    format: "Poules + Arbre Final",
    teamSize: "5v5",
    registeredTeams: 12,
    maxTeams: 64,
    cashprize: 1200,
    currency: "€",
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
    platform: "PC",
    entryFee: "Gratuit",
    region: "Global",
  },
  {
    id: "tourney-4",
    title: "Rocket League 3v3 Supersonic Showdown",
    slug: "rl-supersonic-showdown",
    game: {
      name: "Rocket League",
      code: "rl",
      color: "#38bdf8",
      badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    organizer: {
      name: "French RL Circuit",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80",
    },
    startDate: "30 Oct. 2026",
    startTime: "21:00",
    status: "upcoming",
    format: "Arbre Élimination Directe",
    teamSize: "3v3",
    registeredTeams: 42,
    maxTeams: 64,
    cashprize: 800,
    currency: "€",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
    platform: "Crossplay",
    entryFee: "Gratuit",
    region: "France / FR",
  },
  {
    id: "tourney-5",
    title: "Apex Legends Masters Battle Royale #8",
    slug: "apex-masters-br-8",
    game: {
      name: "Apex Legends",
      code: "apex",
      color: "#a855f7",
      badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    organizer: {
      name: "Apex Global Series Hub",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    },
    startDate: "24 Oct. 2026",
    startTime: "18:00",
    status: "completed",
    format: "Custom Lobby (6 Games)",
    teamSize: "Trio (3v3)",
    registeredTeams: 20,
    maxTeams: 20,
    cashprize: 3000,
    currency: "€",
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
    platform: "Crossplay",
    entryFee: "Gratuit",
    region: "EU",
  },
  {
    id: "tourney-6",
    title: "EA FC 25 Ultimate Kickoff Trophy",
    slug: "eafc-25-ultimate-kickoff",
    game: {
      name: "EA FC 25",
      code: "fc25",
      color: "#10b981",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    organizer: {
      name: "eFootball League France",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80",
    },
    startDate: "05 Nov. 2026",
    startTime: "20:30",
    status: "upcoming",
    format: "Simple Élimination 1v1",
    teamSize: "1v1",
    registeredTeams: 94,
    maxTeams: 128,
    cashprize: 1500,
    currency: "€",
    bannerUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
    platform: "PS5 / Xbox Series / PC",
    entryFee: "Gratuit",
    region: "France",
  },
];

export default function PublicTournamentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedModalTournament, setSelectedModalTournament] = useState<Tournament | null>(null);

  // Filter logic
  const filteredTournaments = useMemo(() => {
    return MOCK_TOURNAMENTS.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.game.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGame = selectedGame === "all" || t.game.code === selectedGame;
      const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;

      return matchesSearch && matchesGame && matchesStatus;
    });
  }, [searchQuery, selectedGame, selectedStatus]);

  const featuredTournaments = MOCK_TOURNAMENTS.filter((t) => t.isFeatured);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Cyber Glow Effects */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent z-0" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/3 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-transform group-hover:scale-105">
              <Gamepad2 className="size-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                HUB<span className="text-cyan-400">GAMERS</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 -mt-1">
                Esport SaaS
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">
              Accueil
            </a>
            <a href="#" className="text-cyan-400 font-semibold flex items-center gap-1.5">
              Tournois
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              Équipes & Clubs
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              Studio Broadcast
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-9 px-4 hover:bg-white/5 transition-colors text-slate-300"
            >
              Connexion
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-9 px-4 bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(0,242,254,0.3)]"
            >
              Organiser un tournoi
            </a>
          </div>
        </div>
      </header>

      {}
      <main className="relative z-10 flex-1 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-12 border-b border-white/[0.08] bg-gradient-to-b from-cyan-950/20 via-black/40 to-transparent">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4 backdrop-blur-md">
                  <Trophy className="size-3.5" />
                  <span>COMPÉTITIONS OFFICIELLES & COMMUNAUTAIRES</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                  Arène des <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Tournois</span>
                </h1>
                <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
                  Rejoignez des centaines de tournois esport quotidiens. Affrontez les meilleures équipes, gagnez des cashprizes et suivez les brackets en direct.
                </p>
              </div>

              {/* Quick stats counter */}
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-3 rounded-2xl backdrop-blur-md">
                <div className="px-3 border-r border-white/[0.08] text-center">
                  <div className="text-xl font-black text-white">{MOCK_TOURNAMENTS.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tournois</div>
                </div>
                <div className="px-3 border-r border-white/[0.08] text-center">
                  <div className="text-xl font-black text-cyan-400">14 000€+</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Cashprize Total</div>
                </div>
                <div className="px-3 text-center">
                  <div className="text-xl font-black text-purple-400">200+</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Rosters Engagés</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        {featuredTournaments.length > 0 && (
          <section className="py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="size-5 text-amber-500 animate-bounce" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">À la Une / Compétitions Maintes</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {featuredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col justify-between"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    style={{ backgroundImage: `url(${tournament.bannerUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${tournament.game.badgeBg}`}>
                        <Gamepad2 className="size-3.5" />
                        {tournament.game.name}
                      </span>

                      {tournament.status === "ongoing" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400 border border-red-500/40 animate-pulse">
                          <Circle className="size-2 fill-red-500 text-red-500" />
                          EN DIRECT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/40">
                          <Clock className="size-3.5" />
                          {tournament.startDate} • {tournament.startTime}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {tournament.title}
                    </h3>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={tournament.organizer.avatar}
                          alt={tournament.organizer.name}
                          className="size-5 rounded-full object-cover border border-white/20"
                        />
                        <span className="font-semibold text-slate-200">{tournament.organizer.name}</span>
                        {tournament.organizer.verified && (
                          <CheckCircle2 className="size-3.5 text-cyan-400 fill-cyan-400/20" />
                        )}
                      </div>
                      <span>•</span>
                      <span>{tournament.format}</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cashprize</div>
                      <div className="text-lg font-black text-amber-400 flex items-center gap-1">
                        <Coins className="size-4" />
                        {tournament.cashprize} {tournament.currency}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Places</div>
                        <div className="text-xs font-bold text-slate-200">
                          {tournament.registeredTeams} / {tournament.maxTeams} Équipes
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedModalTournament(tournament)}
                        className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg"
                      >
                        Voir le tournoi
                        <ChevronRight className="size-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters Section */}
        <section className="mt-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 backdrop-blur-md space-y-4">
            {/* Top row: Search input & Status toggle */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de tournoi, jeu, organisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-medium">
                <button
                  onClick={() => setSelectedStatus("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === "all" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setSelectedStatus("upcoming")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === "upcoming" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  À venir
                </button>
                <button
                  onClick={() => setSelectedStatus("ongoing")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === "ongoing" ? "bg-red-500 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  En direct
                </button>
                <button
                  onClick={() => setSelectedStatus("completed")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === "completed" ? "bg-slate-700 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Terminés
                </button>
              </div>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center gap-1 border-l border-white/10 pl-4">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg border ${
                    viewMode === "grid"
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                  title="Vue Grille"
                >
                  <Layers className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg border ${
                    viewMode === "list"
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                  title="Vue Liste"
                >
                  <SlidersHorizontal className="size-4" />
                </button>
              </div>
            </div>

            {/* Bottom row: Game Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar scrollbar-none">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold pr-1 shrink-0">
                <Filter className="size-3" /> Jeu:
              </span>
              {GAMES_FILTER.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                    selectedGame === game.id
                      ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.2)]"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:border-white/20"
                  }`}
                >
                  {game.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tournaments Grid / List Section */}
        <section className="mt-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-medium">
              {filteredTournaments.length} tournois trouvés
            </span>
            {(selectedGame !== "all" || selectedStatus !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGame("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {filteredTournaments.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-12 text-center">
              <Trophy className="size-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Aucun tournoi ne correspond à votre recherche</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Essayez de modifier vos filtres de jeu ou les termes de votre recherche.
              </p>
              <button
                onClick={() => {
                  setSelectedGame("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-colors"
              >
                Voir tous les tournois
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                >
                  <div>
                    {/* Game Banner Header */}
                    <div className="relative h-32 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl bg-slate-950">
                      <img
                        src={tournament.bannerUrl}
                        alt={tournament.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border backdrop-blur-md ${tournament.game.badgeBg}`}>
                          {tournament.game.name}
                        </span>

                        {tournament.status === "ongoing" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                            <Circle className="size-1.5 fill-white" />
                            LIVE
                          </span>
                        )}
                        {tournament.status === "completed" && (
                          <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                            Terminé
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tournament Info */}
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {tournament.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-xs text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <img
                            src={tournament.organizer.avatar}
                            alt=""
                            className="size-4 rounded-full"
                          />
                          {tournament.organizer.name}
                        </span>
                        <span className="font-mono text-slate-400">{tournament.teamSize}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="size-3.5 text-cyan-400" />
                        <span>{tournament.startDate} • {tournament.startTime}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Format:</span>
                        <span className="font-medium text-slate-200">{tournament.format}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-4 border-t border-white/[0.08]">
                    {/* Progress Bar for Seats */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[11px] font-medium mb-1">
                        <span className="text-slate-400">Inscriptions</span>
                        <span className="text-cyan-400 font-mono">
                          {tournament.registeredTeams} / {tournament.maxTeams}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (tournament.registeredTeams / tournament.maxTeams) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase text-slate-400 font-semibold">Dotation</div>
                        <div className="text-sm font-black text-amber-400">
                          {tournament.cashprize > 0 ? `${tournament.cashprize} ${tournament.currency}` : "Honneur"}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedModalTournament(tournament)}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-400 hover:text-slate-950 hover:border-cyan-400 transition-all"
                      >
                        Détails
                        <ArrowRight className="size-3.5 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 gap-4 backdrop-blur-md hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={tournament.bannerUrl}
                      alt={tournament.title}
                      className="size-16 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tournament.game.badgeBg}`}>
                          {tournament.game.name}
                        </span>
                        {tournament.status === "ongoing" && (
                          <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">• {tournament.region}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {tournament.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Par <strong className="text-slate-200">{tournament.organizer.name}</strong></span>
                        <span>•</span>
                        <span>{tournament.startDate} ({tournament.startTime})</span>
                        <span>•</span>
                        <span>{tournament.teamSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Places</div>
                      <div className="text-xs font-bold text-slate-200">
                        {tournament.registeredTeams} / {tournament.maxTeams}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Cashprize</div>
                      <div className="text-sm font-black text-amber-400">
                        {tournament.cashprize} {tournament.currency}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedModalTournament(tournament)}
                      className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-colors"
                    >
                      Consulter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal Window */}
        {selectedModalTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setSelectedModalTournament(null)}
                className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="size-4" />
              </button>

              {/* Header Image */}
              <div className="relative h-40 -mx-6 -mt-6 mb-6 overflow-hidden">
                <img
                  src={selectedModalTournament.bannerUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${selectedModalTournament.game.badgeBg}`}>
                    {selectedModalTournament.game.name}
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-black/60 px-2.5 py-1 rounded border border-amber-500/30">
                    {selectedModalTournament.cashprize} {selectedModalTournament.currency} Cashprize
                  </span>
                </div>
              </div>

              {/* Title & Details */}
              <h2 className="text-xl font-black text-white">{selectedModalTournament.title}</h2>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Format</span>
                  <span className="font-bold text-white">{selectedModalTournament.teamSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Plateforme</span>
                  <span className="font-bold text-white">{selectedModalTournament.platform}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Frais d'entrée</span>
                  <span className="font-bold text-emerald-400">{selectedModalTournament.entryFee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Région</span>
                  <span className="font-bold text-white">{selectedModalTournament.region}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-4 text-cyan-400" />
                  <span>Organisé par <strong className="text-white">{selectedModalTournament.organizer.name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-cyan-400" />
                  <span>Début des matchs : <strong className="text-white">{selectedModalTournament.startDate} à {selectedModalTournament.startTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Swords className="size-4 text-cyan-400" />
                  <span>Structure de l'arbre : {selectedModalTournament.format}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedModalTournament(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Fermer
                </button>
                <a
                  href="#"
                  className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition-colors shadow-lg"
                >
                  Inscrire mon équipe
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black/80 py-10 relative z-10 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 font-black">
              <Gamepad2 className="size-4" />
            </div>
            <span className="font-bold text-white text-sm">
              Hub<span className="text-cyan-400">Gamers</span>
            </span>
            <span>· Plateforme Esport SaaS © <CurrentYear /></span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Accueil
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Tournois
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Dashboard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}