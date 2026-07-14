import { useState } from "react";

/**
 * Lobby Screen - Brutalist Arcade UI
 * Matches: Lobby-Brutalist.png design
 * 
 * Design notes:
 * - Main headline: SELECT PROTOCOL
 * - Two-column layout: left game mode cards, right sidebar with network status and live feed
 * - Game mode cards use colored headers (yellow, red, green, black)
 * - Heavy borders and drop shadows throughout
 */

const gameModes = [
  {
    id: 1,
    name: "MAZE RUNNER",
    tag: "FFA SPRINT",
    color: "bg-yellow-400",
    maxPlayers: 8,
    inQueue: 1402,
    description: "Standard elimination. Highest score after 3 minutes wins. Ghost speed increases 10% every 30s. No hiding.",
    difficulty: "HOT",
  },
  {
    id: 2,
    name: "PAC ROYALE",
    tag: "ELIMINATION",
    color: "bg-red-500",
    maxPlayers: 100,
    inQueue: 890,
    description: "One giant brutalist maze. Borders shrink. Last PAC standing. Death is permanent.",
    difficulty: null,
  },
  {
    id: 3,
    name: "GHOST PROTOCOL",
    tag: "ASYMMETRIC",
    color: "bg-green-600",
    maxPlayers: 4,
    inQueue: 432,
    description: "One PAC, four ghosts. Ghosts must coordinate. PAC must survive 3 minutes.",
    difficulty: null,
  },
  {
    id: 4,
    name: "RANKED DUEL",
    tag: "1v1",
    color: "bg-black",
    maxPlayers: 2,
    inQueue: 89,
    description: "Mirror maze. Identical pill distribution. Highest score wins. Identical pill layout. Identical pill layout.",
    difficulty: "BETA",
  },
];

const liveEvents = [
  { time: "12s", player: "VOID_EATER", action: "eliminated in ROYALE", color: "bg-red-500" },
  { time: "45s", player: "CHERRY_BOMB", action: "scored 48,200 in SPRINT", color: "bg-yellow-400" },
  { time: "1m", player: "GHOST_KILLA", action: "reached Rank 4", color: "bg-black" },
  { time: "2m", player: "DOT_MUNCHER", action: "eliminated by PINKY", color: "bg-red-500" },
  { time: "2m", player: "POWER_P", action: "won MAZE RUNNER", color: "bg-green-600" },
  { time: "3m", player: "BLINKY_MAIN", action: "streak of 5 kills", color: "bg-red-500" },
];

export default function Lobby() {
  const [selectedMode, setSelectedMode] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-6xl font-black uppercase mb-2 text-black">
          SELECT PROTOCOL
        </h1>
        <p className="text-sm uppercase tracking-widest text-black font-bold">
          CHOOSE YOUR ARENA. NO HESITATION.
        </p>
        <div className="border-b-2 border-black mt-4"></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-8">
        {/* Game Modes Grid */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-6">
            {gameModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`border-2 border-black cursor-pointer transition-all ${
                  selectedMode === mode.id ? "ring-4 ring-black" : ""
                }`}
                style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}
              >
                {/* Mode Header */}
                <div className={`${mode.color} border-b-2 border-black p-4 flex justify-between items-center`}>
                  <div className="font-bold uppercase text-xs tracking-widest text-black">
                    {mode.tag}
                  </div>
                  {mode.difficulty && (
                    <div className="border-2 border-black px-2 py-1 bg-white text-xs font-bold uppercase">
                      {mode.difficulty}
                    </div>
                  )}
                </div>

                {/* Mode Content */}
                <div className="p-4 bg-white">
                  <h3 className="text-2xl font-black uppercase mb-2 text-black">
                    {mode.name}
                  </h3>

                  <div className="flex gap-4 mb-4 text-xs font-bold uppercase tracking-widest">
                    <div>👥 {mode.maxPlayers} MAX</div>
                    <div>⚡ {mode.inQueue.toLocaleString()} IN QUEUE</div>
                  </div>

                  <div className="text-sm text-black mb-4 pb-4 border-b-2 border-black">
                    {mode.description}
                  </div>

                  <button
                    className="w-full arcade-button bg-yellow-400 border-2 border-black font-bold py-3 px-4 uppercase text-sm"
                    style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.6)" }}
                  >
                    ENTER PROTOCOL →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Network Status */}
          <div className="border-2 border-black bg-black p-6 text-white" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
            <div className="text-sm font-bold uppercase tracking-widest mb-4 pb-4 border-b border-white">
              ⚡ NETWORK_STAT
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">STATUS</span>
                <span className="bg-green-500 text-black px-2 py-1 font-bold uppercase text-xs">
                  OPTIMAL
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">PLAYERS ONLINE</span>
                <span className="font-bold">14,082</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">ACTIVE MATCHES</span>
                <span className="font-bold">843</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">PING / REGION</span>
                <span className="font-bold">24ms / US-EAST</span>
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="border-2 border-black bg-white p-6" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
            <div className="text-sm font-bold uppercase tracking-widest mb-4 pb-4 border-b-2 border-black">
              ⚡ LIVE FEED
            </div>

            <div className="space-y-3 text-xs">
              {liveEvents.map((event, idx) => (
                <div key={idx} className="flex gap-3 items-start pb-3 border-b border-gray-300 last:border-0">
                  <span className="font-bold uppercase tracking-widest text-gray-600 min-w-fit">
                    {event.time}
                  </span>
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <span className={`${event.color} text-white px-2 py-1 font-bold uppercase text-xs`}>
                        {event.player.substring(0, 1)}
                      </span>
                      <span className="font-bold uppercase">{event.player}</span>
                    </div>
                    <div className="text-gray-700 uppercase tracking-wide">
                      {event.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 arcade-button bg-yellow-400 border-2 border-black font-bold py-2 px-4 uppercase text-xs">
              VIEW FULL FEED →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
