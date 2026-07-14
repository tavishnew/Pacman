/**
 * Leaderboard Screen - Brutalist Arcade UI
 * Matches: Leaderboard-Brutalist.png design
 * 
 * Design notes:
 * - Large headline: GLOBAL RANKINGS
 * - Season and stats badges at top
 * - Main ranking table on left
 * - Yellow user stats card on right
 * - Current user row highlighted in yellow
 */

const rankings = [
  { rank: 1, handle: "CHERRY_CHASER", score: 948320, matches: 1420, winRate: 88.4, trend: "up" },
  { rank: 2, handle: "POWER_PILL_POPPER", score: 892105, matches: 1205, winRate: 85.1, trend: "flat" },
  { rank: 3, handle: "BLINKY_BANE", score: 884500, matches: 1340, winRate: 82.7, trend: "up" },
  { rank: 4, handle: "GHOST_PROTOCOL", score: 821340, matches: 980, winRate: 89.2, trend: "up" },
  { rank: 5, handle: "COIN_OP_KING", score: 799020, matches: 1115, winRate: 81, trend: "down" },
  { rank: 41, handle: "PELLET_EATER", score: 51430, matches: 84, winRate: 54.2, trend: "down" },
  { rank: 42, handle: "WAKA_THEODORE", score: 48200, matches: 76, winRate: 51.2, trend: "up", isCurrentUser: true },
];

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-amber-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-6xl font-black uppercase text-black">
            GLOBAL<br />RANKINGS
          </h1>
          <div className="flex gap-3">
            <div className="border-2 border-black bg-yellow-400 px-4 py-2 font-bold uppercase text-xs">
              🎯 SEASON 4 ACTIVE
            </div>
            <div className="border-2 border-black bg-black text-white px-4 py-2 font-bold uppercase text-xs">
              ⏱ ENDS IN 12D 04H 21M
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="border-b-2 border-black flex-1"></div>
        </div>

        <div className="flex gap-12 text-sm">
          <div>
            <div className="uppercase tracking-widest font-bold text-xs text-gray-600 mb-1">
              TOTAL PLAYERS
            </div>
            <div className="text-3xl font-black text-black">14,092</div>
          </div>
          <div className="border-l-2 border-black pl-12">
            <div className="uppercase tracking-widest font-bold text-xs text-gray-600 mb-1">
              MATCHES TODAY
            </div>
            <div className="text-3xl font-black text-black">8,401</div>
          </div>
        </div>
      </div>

      <div className="border-b-2 border-black mb-8"></div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-8">
        {/* Rankings Table */}
        <div className="col-span-2">
          <div className="border-2 border-black bg-white overflow-hidden" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-0 bg-black text-white border-b-2 border-black">
              <div className="p-4 font-bold uppercase text-xs tracking-widest border-r border-gray-600">RNK</div>
              <div className="p-4 font-bold uppercase text-xs tracking-widest border-r border-gray-600">HANDLE</div>
              <div className="p-4 font-bold uppercase text-xs tracking-widest border-r border-gray-600">SCORE</div>
              <div className="p-4 font-bold uppercase text-xs tracking-widest border-r border-gray-600">MATCHES</div>
              <div className="p-4 font-bold uppercase text-xs tracking-widest border-r border-gray-600">WIN %</div>
              <div className="p-4 font-bold uppercase text-xs tracking-widest">TRND</div>
            </div>

            {/* Table Rows */}
            {rankings.map((entry, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-6 gap-0 border-b-2 border-black ${
                  entry.isCurrentUser ? "bg-yellow-400" : "bg-white"
                } hover:bg-gray-100 transition-colors`}
              >
                <div className={`p-4 font-bold text-sm border-r border-gray-300 ${entry.isCurrentUser ? "text-black" : ""}`}>
                  {entry.rank === 42 && entry.isCurrentUser ? (
                    <span className="bg-black text-white px-2 py-1 text-xs font-bold">YOU</span>
                  ) : (
                    entry.rank
                  )}
                </div>
                <div className={`p-4 font-bold uppercase text-sm border-r border-gray-300 ${entry.isCurrentUser ? "text-black" : ""}`}>
                  {entry.handle}
                </div>
                <div className={`p-4 font-bold text-sm border-r border-gray-300 ${entry.isCurrentUser ? "text-black" : ""}`}>
                  {entry.score.toLocaleString()}
                </div>
                <div className={`p-4 font-bold text-sm border-r border-gray-300 ${entry.isCurrentUser ? "text-black" : ""}`}>
                  {entry.matches.toLocaleString()}
                </div>
                <div className={`p-4 font-bold text-sm border-r border-gray-300 ${entry.isCurrentUser ? "text-black" : ""}`}>
                  {entry.winRate}%
                </div>
                <div className={`p-4 font-bold text-sm ${entry.isCurrentUser ? "text-black" : ""}`}>
                  {entry.trend === "up" && "📈"}
                  {entry.trend === "down" && "📉"}
                  {entry.trend === "flat" && "−"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Stats Sidebar */}
        <div className="border-2 border-black bg-yellow-400 p-6" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-6 pb-6 border-b-2 border-black">
            👤 YOUR<br />STARTER
          </div>

          <div className="space-y-6">
            {/* Current Rank */}
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-gray-800 mb-2">
                CURRENT RANK
              </div>
              <div className="text-4xl font-black text-black">42</div>
            </div>

            <div className="border-b-2 border-black"></div>

            {/* Score */}
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-gray-800 mb-2">
                SCORE
              </div>
              <div className="text-4xl font-black text-black">48,200</div>
            </div>

            <div className="border-b-2 border-black"></div>

            {/* Win Rate */}
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-gray-800 mb-2">
                WIN RATE
              </div>
              <div className="text-4xl font-black text-black">51.2%</div>
            </div>

            <div className="border-b-2 border-black"></div>

            {/* Next Target */}
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-gray-800 mb-2">
                NEXT TARGET: PELLET_EATER
              </div>
              <div className="w-full bg-white border-2 border-black h-4 mb-2"></div>
              <div className="text-xs font-bold text-black">
                3,230 PTS AWAY
              </div>
            </div>

            <div className="border-b-2 border-black"></div>

            {/* Find Match Button */}
            <button className="w-full arcade-button bg-black text-white border-2 border-black font-bold py-4 px-4 uppercase text-sm">
              FIND MATCH
            </button>
          </div>

          {/* Rankings Section */}
          <div className="mt-8 pt-8 border-t-2 border-black">
            <div className="text-sm font-bold uppercase tracking-widest mb-4 text-black">
              📊 RANKINGS
            </div>
            <div className="text-xs text-black space-y-2">
              <div className="flex justify-between">
                <span>SOLO RANKED</span>
                <span className="font-bold">#42</span>
              </div>
              <div className="flex justify-between">
                <span>TEAM EVENTS</span>
                <span className="font-bold">#187</span>
              </div>
              <div className="flex justify-between">
                <span>SURVIVAL MODE</span>
                <span className="font-bold">#12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
