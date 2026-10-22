"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Shield,
  Search,
  Filter,
  Trophy,
  Gamepad2,
  CheckCircle2,
  Globe,
  ExternalLink,
  Crown,
  ChevronRight,
  Plus,
  UserPlus,
  Layers,
  SlidersHorizontal,
  X,
  Award,
  Sparkles,
  TrendingUp,
  Flame,
  MessageSquare,
  MapPin,
  Calendar,
} from "lucide-react";

export interface TeamMember {
  id: string;
  nickname: string;
  role: "Captain" | "Player" | "Substitute" | "Coach";
  avatar: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  slug: string;
  logo: string;
  bannerUrl: string;
  verified: boolean;
  type: "Association" | "Club Pro" | "Esport Mix" | "Communauté";
  region: string;
  createdYear: string;
  games: {
    name: string;
    code: string;
    color: string;
  }[];
  stats: {
    tournamentsPlayed: number;
    trophiesCount: number;
    winRate: number; // percentage
  };
  membersCount: number;
  maxMembers: number;
  isRecruiting: boolean;
  recruitingRoles?: string[];
  description: string;
  isFeatured?: boolean;
}

const GAME_OPTIONS = [
  { id: "all", label: "Tous les jeux" },
  { id: "valorant", label: "Valorant" },
  { id: "lol", label: "League of Legends" },
  { id: "cs2", label: "Counter-Strike 2" },
  { id: "rl", label: "Rocket League" },
  { id: "apex", label: "Apex Legends" },
  { id: "fc25", label: "EA FC 25" },
];

const MOCK_TEAMS: Team[] = [
  {
    id: "team-1",
    name: "Aegis Esports",
    tag: "AGS",
    slug: "aegis-esports",
    logo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    verified: true,
    type: "Club Pro",
    region: "France",
    createdYear: "2021",
    games: [
      { name: "Valorant", code: "valorant", color: "#ff4655" },
      { name: "League of Legends", code: "lol", color: "#00a3ff" },
    ],
    stats: {
      tournamentsPlayed: 48,
      trophiesCount: 14,
      winRate: 68,
    },
    membersCount: 12,
    maxMembers: 15,
    isRecruiting: true,
    recruitingRoles: ["Initiator (Valorant)", "Analyste LoL"],
    description: "Structure esport professionnelle française engagée dans les compétitions majeures nationales et européennes.",
    isFeatured: true,
  },
  {
    id: "team-2",
    name: "Vanguard Syndicate",
    tag: "VNG",
    slug: "vanguard-syndicate",
    logo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    verified: true,
    type: "Club Pro",
    region: "Europe / EU West",
    createdYear: "2020",
    games: [
      { name: "Counter-Strike 2", code: "cs2", color: "#f59e0b" },
      { name: "Valorant", code: "valorant", color: "#ff4655" },
    ],
    stats: {
      tournamentsPlayed: 62,
      trophiesCount: 21,
      winRate: 74,
    },
    membersCount: 10,
    maxMembers: 12,
    isRecruiting: false,
    description: "Collectif compétitif axé sur la rigueur tactique et les performances de haut niveau en FPS tactique.",
    isFeatured: true,
  },
  {
    id: "team-3",
    name: "Karmine Academy Rivals",
    tag: "KAR",
    slug: "karmine-academy-rivals",
    logo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80",
    verified: true,
    type: "Association",
    region: "France",
    createdYear: "2023",
    games: [{ name: "Rocket League", code: "rl", color: "#38bdf8" }],
    stats: {
      tournamentsPlayed: 29,
      trophiesCount: 7,
      winRate: 59,
    },
    membersCount: 5,
    maxMembers: 8,
    isRecruiting: true,
    recruitingRoles: ["Joueur RL Grand Champion 3+"],
    description: "Section espoir et académie dédiée au repérage et au développement de jeunes talents esportifs.",
    isFeatured: false,
  },
  {
    id: "team-4",
    name: "Phoenix Rising Strikers",
    tag: "PRS",
    slug: "phoenix-rising-strikers",
    logo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    verified: false,
    type: "Esport Mix",
    region: "Global",
    createdYear: "2024",
    games: [
      { name: "Apex Legends", code: "apex", color: "#a855f7" },
      { name: "EA FC 25", code: "fc25", color: "#10b981" },
    ],
    stats: {
      tournamentsPlayed: 18,
      trophiesCount: 3,
      winRate: 52,
    },
    membersCount: 8,
    maxMembers: 10,
    isRecruiting: true,
    recruitingRoles: ["IGL Apex Legends", "Manager Réseaux"],
    description: "Roster passionné se développant sur Battle Royale et simulation sportive en environnement communautaire.",
    isFeatured: false,
  },
  {
    id: "team-5",
    name: "Nebula Gaming Club",
    tag: "NGC",
    slug: "nebula-gaming-club",
    logo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    verified: false,
    type: "Communauté",
    region: "Belgique / FR",
    createdYear: "2022",
    games: [
      { name: "League of Legends", code: "lol", color: "#00a3ff" },
      { name: "Valorant", code: "valorant", color: "#ff4655" },
    ],
    stats: {
      tournamentsPlayed: 34,
      trophiesCount: 8,
      winRate: 61,
    },
    membersCount: 22,
    maxMembers: 30,
    isRecruiting: false,
    description: "Club multi-gaming ouvert axé sur l'entraide, le scrim régulier et les tournois hebdomadaires.",
    isFeatured: false,
  },
  {
    id: "team-6",
    name: "Cyber Dynasty",
    tag: "CYD",
    slug: "cyber-dynasty",
    logo: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
    verified: true,
    type: "Club Pro",
    region: "Suisse / FR",
    createdYear: "2019",
    games: [{ name: "EA FC 25", code: "fc25", color: "#10b981" }],
    stats: {
      tournamentsPlayed: 85,
      trophiesCount: 32,
      winRate: 81,
    },
    membersCount: 6,
    maxMembers: 8,
    isRecruiting: true,
    recruitingRoles: ["Joueur EA FC 25 2v2"],
    description: "Écurie spécialisée dans la simulation de football compétitif avec plusieurs titres nationaux à son actif.",
    isFeatured: false,
  },
];

export default function PublicTeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const [selectedTeamModal, setSelectedTeamModal] = useState<Team | null>(null);

  // Filtered teams computation
  const filteredTeams = useMemo(() => {
    return MOCK_TEAMS.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGame =
        selectedGame === "all" ||
        team.games.some((g) => g.code === selectedGame);

      const matchesRecruiting = !recruitingOnly || team.isRecruiting;

      return matchesSearch && matchesGame && matchesRecruiting;
    });
  }, [searchQuery, selectedGame, recruitingOnly]);

  const featuredTeams = MOCK_TEAMS.filter((t) => t.isFeatured);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Cyber Glow Effects */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent z-0" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

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
            <a href="#" className="hover:text-cyan-400 transition-colors">
              Tournois
            </a>
            <a href="#" className="text-cyan-400 font-semibold flex items-center gap-1.5">
              Équipes & Clubs
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
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
              Créer un Club
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-12 border-b border-white/[0.08] bg-gradient-to-b from-cyan-950/20 via-black/40 to-transparent">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4 backdrop-blur-md">
                  <Shield className="size-3.5" />
                  <span>ANNUAIRE OFFICIEL DE LA COMMUNAUTÉ</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                  Équipes & <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Clubs Esport</span>
                </h1>
                <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
                  Découvrez les structures et rosters esport compétitifs. Postulez pour rejoindre une équipe ou défiez les meilleurs clubs de la région.
                </p>
              </div>

              {/* Quick stats counter */}
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-3 rounded-2xl backdrop-blur-md">
                <div className="px-3 border-r border-white/[0.08] text-center">
                  <div className="text-xl font-black text-white">{MOCK_TEAMS.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Clubs Inscrits</div>
                </div>
                <div className="px-3 border-r border-white/[0.08] text-center">
                  <div className="text-xl font-black text-cyan-400">80+</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Trophées Gagnés</div>
                </div>
                <div className="px-3 text-center">
                  <div className="text-xl font-black text-emerald-400">
                    {MOCK_TEAMS.filter((t) => t.isRecruiting).length}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Recrutent</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Teams Section */}
        {featuredTeams.length > 0 && (
          <section className="py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="size-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Structures Partenaires / À la Une</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {featuredTeams.map((team) => (
                <div
                  key={team.id}
                  className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col justify-between"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-15 transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    style={{ backgroundImage: `url(${team.bannerUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="size-14 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-lg"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                              {team.name}
                            </h3>
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                              [{team.tag}]
                            </span>
                            {team.verified && (
                              <CheckCircle2 className="size-4 text-cyan-400 fill-cyan-400/20" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <span className="text-slate-300 font-medium">{team.type}</span>
                            <span>•</span>
                            <span>{team.region}</span>
                          </p>
                        </div>
                      </div>

                      {team.isRecruiting && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 shrink-0">
                          <UserPlus className="size-3.5" />
                          Recrute
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {team.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {team.games.map((g) => (
                        <span
                          key={g.code}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-slate-200"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Trophées</div>
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <Trophy className="size-3.5" />
                          {team.stats.trophiesCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Win Rate</div>
                        <div className="font-bold text-cyan-400">{team.stats.winRate}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Membres</div>
                        <div className="font-bold text-slate-200">
                          {team.membersCount} / {team.maxMembers}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTeamModal(team)}
                      className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg"
                    >
                      Voir le profil
                      <ChevronRight className="size-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters and Search Bar */}
        <section className="mt-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 backdrop-blur-md space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'équipe, tag, description..."
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

              {/* Recruiting Toggle */}
              <button
                onClick={() => setRecruitingOnly(!recruitingOnly)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  recruitingOnly
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "border-white/10 bg-black/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserPlus className="size-4" />
                <span>Recrutement Ouvert Uniquement</span>
              </button>
            </div>

            {/* Game Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar scrollbar-none">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold pr-1 shrink-0">
                <Filter className="size-3" /> Jeu:
              </span>
              {GAME_OPTIONS.map((game) => (
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

        {/* Teams Grid */}
        <section className="mt-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-medium">
              {filteredTeams.length} équipes répertoriées
            </span>
            {(selectedGame !== "all" || recruitingOnly || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGame("all");
                  setRecruitingOnly(false);
                  setSearchQuery("");
                }}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {filteredTeams.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-12 text-center">
              <Shield className="size-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Aucune équipe ne correspond à votre recherche</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Essayez d'ajuster vos filtres de jeux ou désactivez l'option de recrutement uniquement.
              </p>
              <button
                onClick={() => {
                  setSelectedGame("all");
                  setRecruitingOnly(false);
                  setSearchQuery("");
                }}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-colors"
              >
                Voir toutes les équipes
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="size-12 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {team.name}
                            </h3>
                            {team.verified && (
                              <CheckCircle2 className="size-3.5 text-cyan-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-xs font-mono text-cyan-400 font-semibold">
                            [{team.tag}]
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-300 shrink-0">
                        {team.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {team.description}
                    </p>

                    {/* Games Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {team.games.map((g) => (
                        <span
                          key={g.code}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/5"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-white/[0.08]">
                    {team.isRecruiting && team.recruitingRoles && team.recruitingRoles.length > 0 && (
                      <div className="mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                        <span className="font-bold text-emerald-400 block mb-0.5">Recherche active :</span>
                        <span className="line-clamp-1">{team.recruitingRoles.join(", ")}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase">Victoires</span>
                        <span className="font-bold text-cyan-400">{team.stats.winRate}%</span>
                      </div>

                      <div className="text-xs text-right">
                        <span className="text-slate-400 block text-[10px] uppercase">Roster</span>
                        <span className="font-bold text-slate-200">
                          {team.membersCount}/{team.maxMembers}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedTeamModal(team)}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-400 hover:text-slate-950 hover:border-cyan-400 transition-all"
                      >
                        Consulter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal Team Details */}
        {selectedTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedTeamModal(null)}
                className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="size-4" />
              </button>

              {/* Banner & Logo */}
              <div className="relative h-36 -mx-6 -mt-6 mb-12 overflow-hidden">
                <img
                  src={selectedTeamModal.bannerUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                  <img
                    src={selectedTeamModal.logo}
                    alt=""
                    className="size-20 rounded-2xl object-cover border-4 border-slate-900 bg-slate-950 shadow-xl"
                  />
                </div>
              </div>

              {/* Title & Tag */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{selectedTeamModal.name}</h2>
                    <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      [{selectedTeamModal.tag}]
                    </span>
                    {selectedTeamModal.verified && (
                      <CheckCircle2 className="size-5 text-cyan-400 fill-cyan-400/20" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedTeamModal.type} • Fondé en {selectedTeamModal.createdYear} • {selectedTeamModal.region}
                  </p>
                </div>

                {selectedTeamModal.isRecruiting && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <UserPlus className="size-3.5" /> Recrutement Ouvert
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                {selectedTeamModal.description}
              </p>

              {/* Stats Box */}
              <div className="mt-5 grid grid-cols-3 gap-3 bg-white/[0.03] p-4 rounded-xl border border-white/10 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tournois Joués</span>
                  <span className="text-lg font-black text-white">{selectedTeamModal.stats.tournamentsPlayed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Trophées</span>
                  <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                    <Trophy className="size-4" />
                    {selectedTeamModal.stats.trophiesCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Taux de Victoires</span>
                  <span className="text-lg font-black text-cyan-400">{selectedTeamModal.stats.winRate}%</span>
                </div>
              </div>

              {/* Active Recruiting Roles */}
              {selectedTeamModal.isRecruiting && selectedTeamModal.recruitingRoles && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserPlus className="size-4 text-emerald-400" />
                    Postes Recherchés
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeamModal.recruitingRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedTeamModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Fermer
                </button>
                <button className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition-colors shadow-lg flex items-center gap-1.5">
                  <MessageSquare className="size-4" />
                  Contacter le Club / Postuler
                </button>
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
            <span>· Plateforme Esport SaaS © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Accueil
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Tournois
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Équipes
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}