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
  Crown,
  ChevronRight,
  Plus,
  UserPlus,
  X,
  MessageSquare,
  Swords,
  Flame,
  Zap,
  Mic,
  MicOff,
  Crosshair,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Check,
  Radio,
  ArrowRight
} from "lucide-react";

export type GameMode = "Ranked" | "Casual" | "Competitive Scrim" | "Fun / Chill";

export interface SquadMember {
  id: string;
  nickname: string;
  rank?: string;
  role?: string;
  avatar: string;
  isLeader?: boolean;
}

export interface Squad {
  id: string;
  title: string;
  game: {
    name: string;
    code: string;
    iconColor: string;
  };
  mode: GameMode;
  targetRank?: string;
  region: string;
  micRequired: boolean;
  minAge?: number;
  currentMembers: SquadMember[];
  maxMembers: number;
  lookingForRoles: string[];
  description: string;
  createdAt: string;
  tags: string[];
  host: {
    name: string;
    avatar: string;
    verified: boolean;
  };
}

const GAME_OPTIONS = [
  { id: "all", label: "Tous les jeux" },
  { id: "valorant", label: "Valorant" },
  { id: "lol", label: "League of Legends" },
  { id: "cs2", label: "Counter-Strike 2" },
  { id: "rl", label: "Rocket League" },
  { id: "apex", label: "Apex Legends" },
  { id: "fc25", label: "EA FC 25" },
  { id: "fortnite", label: "Fortnite" },
];

const MODE_OPTIONS: { id: string; label: string }[] = [
  { id: "all", label: "Tous les modes" },
  { id: "Ranked", label: "Ranked / Classé" },
  { id: "Casual", label: "Casual / Normal" },
  { id: "Competitive Scrim", label: "Scrim / Entraînement" },
  { id: "Fun / Chill", label: "Fun / Detente" },
];

const MOCK_SQUADS: Squad[] = [
  {
    id: "sq-1",
    title: "Grind Ascendant / Immortal - Recherche Dualiste ou Initiateur",
    game: { name: "Valorant", code: "valorant", iconColor: "#ff4655" },
    mode: "Ranked",
    targetRank: "Diamond - Ascendant",
    region: "EU West / FR",
    micRequired: true,
    minAge: 18,
    maxMembers: 5,
    currentMembers: [
      { id: "m1", nickname: "Vortex_99", role: "Controller", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80", isLeader: true },
      { id: "m2", nickname: "SovaGod", role: "Initiator", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80" },
      { id: "m3", nickname: "SageMain", role: "Sentinel", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80" },
    ],
    lookingForRoles: ["Duelist", "Initiator"],
    description: "Session ranked intense ce soir. Objectif +100 RR. Ambiance tryhard mais pas de toxicité. Micro Discord obligatoire.",
    createdAt: "Il y a 10 min",
    tags: ["Tryhard", "Discord", "Mental+", "18+"],
    host: {
      name: "Vortex_99",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      verified: true,
    },
  },
  {
    id: "sq-2",
    title: "Aram Chill & Normal Games sans prise de tête !",
    game: { name: "League of Legends", code: "lol", iconColor: "#00a3ff" },
    mode: "Casual",
    targetRank: "Tous rangs",
    region: "EUW",
    micRequired: false,
    maxMembers: 5,
    currentMembers: [
      { id: "m4", nickname: "PentaKing", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80", isLeader: true },
      { id: "m5", nickname: "AhriLover", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80" },
    ],
    lookingForRoles: ["N'importe quel rôle", "Flex"],
    description: "On joue tranquilles entre potes. Débutants ou expérimentés bienvenus. Vocal pas obligatoire si tu préfères le chat en jeu.",
    createdAt: "Il y a 25 min",
    tags: ["Chill", "Sans Pression", "Fun"],
    host: {
      name: "PentaKing",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80",
      verified: false,
    },
  },
  {
    id: "sq-3",
    title: "FACEIT Level 8+ Stack 5v5 - Scrim prep & Ladder",
    game: { name: "Counter-Strike 2", code: "cs2", iconColor: "#f59e0b" },
    mode: "Competitive Scrim",
    targetRank: "Faceit Level 6-10",
    region: "Europe",
    micRequired: true,
    minAge: 18,
    maxMembers: 5,
    currentMembers: [
      { id: "m6", nickname: "AWP_God_FR", role: "AWPer", avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80", isLeader: true },
      { id: "m7", nickname: "Rifle_Pro", role: "Rifler", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" },
      { id: "m8", nickname: "IGL_Master", role: "IGL", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
      { id: "m9", nickname: "Entry_Fragger", role: "Entry", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80" },
    ],
    lookingForRoles: ["Support / Anchor B"],
    description: "Recherche un dernier joueur solide pour stack Faceit Premium ce soir. Connaissance des strats Mirage/Inferno/Anubis.",
    createdAt: "Il y a 5 min",
    tags: ["FACEIT", "Scrim", "Tactique", "Discord"],
    host: {
      name: "AWP_God_FR",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80",
      verified: true,
    },
  },
  {
    id: "sq-4",
    title: "Trio Rocket League - Push Grand Champion",
    game: { name: "Rocket League", code: "rl", iconColor: "#38bdf8" },
    mode: "Ranked",
    targetRank: "Champion",
    region: "EU",
    micRequired: true,
    maxMembers: 3,
    currentMembers: [
      { id: "m10", nickname: "FlipReset_360", avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80", isLeader: true },
      { id: "m11", nickname: "AerialKing", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" },
    ],
    lookingForRoles: ["Joueur 3v3 C2/C3"],
    description: "Besoin d'un bon 3ème joueur avec bonne rotation et mécaniques propres. Comms en vocal.",
    createdAt: "Il y a 40 min",
    tags: ["Ranked 3v3", "Rotations", "Vocal"],
    host: {
      name: "FlipReset_360",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
      verified: false,
    },
  },
  {
    id: "sq-5",
    title: "Apex Predator Push - Trio Ranked Diamond+",
    game: { name: "Apex Legends", code: "apex", iconColor: "#a855f7" },
    mode: "Ranked",
    targetRank: "Platinum - Diamond",
    region: "EU",
    micRequired: true,
    minAge: 16,
    maxMembers: 3,
    currentMembers: [
      { id: "m12", nickname: "Pathfinder_Main", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80", isLeader: true },
    ],
    lookingForRoles: ["IGL / Support (Gibby/Newcastle)", "Anchor"],
    description: "Recherche 2 joueurs calmes et stratégiques pour push Master/Predator. Pas de rage quit.",
    createdAt: "Il y a 1h",
    tags: ["Tryhard", "BR", "Comms"],
    host: {
      name: "Pathfinder_Main",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      verified: true,
    },
  },
];

export default function SquadFinderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [micOnly, setMicOnly] = useState(false);
  const [selectedSquadModal, setSelectedSquadModal] = useState<Squad | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating a new squad
  const [newSquadTitle, setNewSquadTitle] = useState("");
  const [newSquadGame, setNewSquadGame] = useState("valorant");
  const [newSquadMode, setNewSquadMode] = useState<GameMode>("Ranked");
  const [newSquadDesc, setNewSquadDesc] = useState("");
  const [newSquadMic, setNewSquadMic] = useState(true);

  // Filtered Squads
  const filteredSquads = useMemo(() => {
    return MOCK_SQUADS.filter((squad) => {
      const matchesSearch =
        squad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        squad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        squad.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGame =
        selectedGame === "all" || squad.game.code === selectedGame;

      const matchesMode =
        selectedMode === "all" || squad.mode === selectedMode;

      const matchesMic = !micOnly || squad.micRequired;

      return matchesSearch && matchesGame && matchesMode && matchesMic;
    });
  }, [searchQuery, selectedGame, selectedMode, micOnly]);

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Votre squad a été créée avec succès ! Elle est désormais visible par la communauté.");
    setIsCreateModalOpen(false);
    setNewSquadTitle("");
    setNewSquadDesc("");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Cyber Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 size-96 rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Header Navigation */}
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
            <a href="#" className="hover:text-cyan-400 transition-colors">
              Clubs & Équipes
            </a>
            <a href="#" className="text-cyan-400 font-semibold flex items-center gap-1.5">
              Trouver une Squad
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold h-9 px-4 bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105"
            >
              <Plus className="size-4 stroke-[3]" />
              Créer une Squad
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-10 border-b border-white/[0.08] bg-gradient-to-b from-cyan-950/20 via-black/40 to-transparent">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3 backdrop-blur-md">
                  <Swords className="size-3.5" />
                  <span>SQUAD & TEAMMATE FINDER</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                  Trouvez vos coéquipiers <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Ranked & Casual</span>
                </h1>
                <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
                  Rejoignez des escouades en direct pour performer en Ranked ou jouer sans pression. Filtrez par jeu, mode et micro.
                </p>
              </div>

              {/* Realtime Stats */}
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-3 rounded-2xl backdrop-blur-md shrink-0">
                <div className="px-3 border-r border-white/[0.08] text-center">
                  <div className="text-xl font-black text-white flex items-center justify-center gap-1">
                    <Radio className="size-4 text-emerald-400 animate-pulse" />
                    {MOCK_SQUADS.length}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Squads Actives</div>
                </div>
                <div className="px-3 border-r border-white/[0.08] text-center">
                  <div className="text-xl font-black text-cyan-400">142</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Joueurs en Recherche</div>
                </div>
                <div className="px-3 text-center">
                  <div className="text-xl font-black text-amber-400">
                    {MOCK_SQUADS.filter((s) => s.mode === "Ranked").length}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Lobbies Ranked</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="mt-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 backdrop-blur-md space-y-4 shadow-xl">
            {/* Search Input & Mode Filter Row */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, rôle, rang, tags (ex: Gold, Controller, Tryhard)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
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

              {/* Mode Select Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1">
                {MODE_OPTIONS.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                      selectedMode === mode.id
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.2)]"
                        : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:border-white/20"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Mic Toggle */}
              <button
                onClick={() => setMicOnly(!micOnly)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                  micOnly
                    ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.2)]"
                    : "border-white/10 bg-black/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                {micOnly ? <Mic className="size-4 text-cyan-400" /> : <MicOff className="size-4" />}
                <span>Micro Requis</span>
              </button>
            </div>

            {/* Game Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/[0.06] no-scrollbar scrollbar-none">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold pr-2 shrink-0">
                <Filter className="size-3.5" /> Jeu:
              </span>
              {GAME_OPTIONS.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                    selectedGame === game.id
                      ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.2)]"
                      : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:border-white/20"
                  }`}
                >
                  {game.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Squad Cards Grid */}
        <section className="mt-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-medium">
              {filteredSquads.length} squad{filteredSquads.length > 1 ? "s" : ""} disponible{filteredSquads.length > 1 ? "s" : ""}
            </span>
            {(selectedGame !== "all" || selectedMode !== "all" || micOnly || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGame("all");
                  setSelectedMode("all");
                  setMicOnly(false);
                  setSearchQuery("");
                }}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {filteredSquads.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-12 text-center">
              <Users className="size-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Aucune squad ne correspond à votre recherche</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Essayez d'ajuster vos critères ou soyez le premier à créer une escouade !
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg"
              >
                <Plus className="size-4 mr-1.5 stroke-[3]" />
                Créer une Squad
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSquads.map((squad) => {
                const slotsLeft = squad.maxMembers - squad.currentMembers.length;
                const isFull = slotsLeft === 0;

                return (
                  <div
                    key={squad.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border bg-black/40"
                          style={{ borderColor: `${squad.game.iconColor}40`, color: squad.game.iconColor }}
                        >
                          <span className="size-2 rounded-full" style={{ backgroundColor: squad.game.iconColor }} />
                          {squad.game.name}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              squad.mode === "Ranked"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : squad.mode === "Competitive Scrim"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {squad.mode}
                          </span>

                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="size-3" />
                            {squad.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-3">
                        {squad.title}
                      </h3>

                      {/* Target Rank / Info */}
                      {squad.targetRank && (
                        <div className="flex items-center gap-2 text-xs text-slate-300 mb-3 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                          <Trophy className="size-3.5 text-amber-400 shrink-0" />
                          <span className="text-slate-400">Niveau visé :</span>
                          <span className="font-semibold text-amber-300">{squad.targetRank}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {squad.description}
                      </p>

                      {/* Looking for Roles Badges */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Rôles recherchés :
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {squad.lookingForRoles.map((role, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            >
                              + {role}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Current Roster Avatars */}
                      <div className="flex items-center justify-between mb-4 pt-3 border-t border-white/[0.06]">
                        <div className="flex items-center -space-x-2 overflow-hidden">
                          {squad.currentMembers.map((member) => (
                            <img
                              key={member.id}
                              src={member.avatar}
                              alt={member.nickname}
                              title={member.nickname + (member.isLeader ? " (Leader)" : "")}
                              className={`inline-block size-8 rounded-full ring-2 ring-slate-900 object-cover ${
                                member.isLeader ? "border-2 border-amber-400" : ""
                              }`}
                            />
                          ))}
                          {Array.from({ length: slotsLeft }).map((_, i) => (
                            <div
                              key={i}
                              className="flex size-8 items-center justify-center rounded-full bg-white/[0.05] border border-dashed border-white/20 text-slate-500 text-xs font-bold ring-2 ring-slate-900"
                            >
                              ?
                            </div>
                          ))}
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-200">
                            {squad.currentMembers.length} / {squad.maxMembers}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {isFull ? "Complet" : `${slotsLeft} place${slotsLeft > 1 ? "s" : ""} libre${slotsLeft > 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {squad.micRequired ? (
                          <span className="flex items-center gap-1 text-cyan-400 font-medium text-[11px]">
                            <Mic className="size-3.5" /> Vocal On
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <MicOff className="size-3.5" /> Optionnel
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedSquadModal(squad)}
                        disabled={isFull}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                          isFull
                            ? "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
                            : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
                        }`}
                      >
                        {isFull ? "Squad Complète" : "Rejoindre la Squad"}
                        {!isFull && <ArrowRight className="size-3.5 ml-1" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Modal Detail Squad */}
        {selectedSquadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl overflow-hidden">
              <button
                onClick={() => setSelectedSquadModal(null)}
                className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-lg border bg-black/40"
                  style={{
                    borderColor: `${selectedSquadModal.game.iconColor}40`,
                    color: selectedSquadModal.game.iconColor,
                  }}
                >
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: selectedSquadModal.game.iconColor }} />
                  {selectedSquadModal.game.name}
                </span>

                <span className="text-xs font-bold px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                  {selectedSquadModal.mode}
                </span>
              </div>

              <h2 className="text-xl font-black text-white mb-2">{selectedSquadModal.title}</h2>

              <p className="text-xs text-slate-400 mb-4 flex items-center gap-3">
                <span>Créé par <strong className="text-slate-200">{selectedSquadModal.host.name}</strong></span>
                <span>•</span>
                <span>Région: <strong className="text-slate-200">{selectedSquadModal.region}</strong></span>
              </p>

              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 mb-5 space-y-3">
                <div className="text-xs text-slate-300 leading-relaxed">
                  {selectedSquadModal.description}
                </div>

                {selectedSquadModal.targetRank && (
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Rang requis / visé:</span>
                    <span className="font-bold text-amber-400">{selectedSquadModal.targetRank}</span>
                  </div>
                )}
              </div>

              {/* Roster Current List */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Membres actuels ({selectedSquadModal.currentMembers.length}/{selectedSquadModal.maxMembers})
                </h4>
                <div className="space-y-2">
                  {selectedSquadModal.currentMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt="" className="size-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {m.nickname}
                            {m.isLeader && (
                              <Crown className="size-3 text-amber-400 fill-amber-400/20" />
                            )}
                          </div>
                          {m.role && <span className="text-[10px] text-cyan-400 font-medium">{m.role}</span>}
                        </div>
                      </div>
                      {m.isLeader && <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded">Chef de Squad</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedSquadModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    alert("Demande envoyée au chef de squad !");
                    setSelectedSquadModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition-colors shadow-lg flex items-center gap-2"
                >
                  <MessageSquare className="size-4" />
                  Envoyer une demande de vocal / groupe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Create Squad */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl overflow-hidden">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
                  <Plus className="size-5 stroke-[3]" />
                </div>
                <h2 className="text-xl font-black text-white">Créer une Squad</h2>
              </div>

              <form onSubmit={handleCreateSquad} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Push Ascendant ce soir - Besoin Controller & Vocal"
                    value={newSquadTitle}
                    onChange={(e) => setNewSquadTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Jeu</label>
                    <select
                      value={newSquadGame}
                      onChange={(e) => setNewSquadGame(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {GAME_OPTIONS.filter((g) => g.id !== "all").map((g) => (
                        <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mode de jeu</label>
                    <select
                      value={newSquadMode}
                      onChange={(e) => setNewSquadMode(e.target.value as GameMode)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="Ranked" className="bg-slate-900">Ranked / Classé</option>
                      <option value="Casual" className="bg-slate-900">Casual / Normal</option>
                      <option value="Competitive Scrim" className="bg-slate-900">Scrim / Entraînement</option>
                      <option value="Fun / Chill" className="bg-slate-900">Fun / Detente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Description & Rôles recherchés
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Précisez votre niveau, les rôles recherchés, le serveur, etc."
                    value={newSquadDesc}
                    onChange={(e) => setNewSquadDesc(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-xs font-semibold text-slate-300">Micro Vocal Obligatoire ?</span>
                  <input
                    type="checkbox"
                    checked={newSquadMic}
                    onChange={(e) => setNewSquadMic(e.target.checked)}
                    className="size-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition-colors shadow-lg"
                  >
                    Publier la Squad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black/80 py-8 relative z-10 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 font-black">
              <Gamepad2 className="size-4" />
            </div>
            <span className="font-bold text-white text-sm">
              Hub<span className="text-cyan-400">Gamers</span>
            </span>
            <span>· Squad Finder & Matchmaking Esport</span>
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