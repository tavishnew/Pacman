/**
 * Profile Screen - Brutalist Arcade UI
 * Matches: Profile-Brutalist.png design
 * 
 * Design notes:
 * - Two-column layout: left user info and stats, right squad panel
 * - Profile avatar as large letter tile
 * - Combat metrics in colored boxes
 * - Squad management with recruit button
 */

const squadMembers = [
  { handle: "GHOST_KLR_88", status: "IN LOBBY", color: "bg-green-600" },
  { handle: "CHERRY_CHASER", status: "IN GAME", color: "bg-green-600" },
  { handle: "POWER_PELLET", status: "IN LOBBY", color: "bg-green-600" },
  { handle: "BLINKY_BANE", status: "LAST SEEN 2D AGO", color: "bg-gray-400" },
  { handle: "WAKA_WAKA_99", status: "LAST SEEN 5D AGO", color: "bg-gray-400" },
];

const recentMatches = [
  { type: "SURVIVAL", result: "VICTORY", survived: "2M 40S", score: 12400 },
  { type: "DEATHMATCH", result: "DEFEAT", survived: "1M 15S", score: 8200 },
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-amber-50 p-8">
      {/* Profile Header */}
      <div className="mb-8 border-2 border-black bg-white p-6" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
        <div className="flex items-start justify-between">
          {/* Avatar and Info */}
          <div className="flex gap-6 items-start">
            {/* Avatar Tile */}
            <div className="w-32 h-32 bg-yellow-400 border-2 border-black flex items-center justify-center text-6xl font-black text-black" style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.8)" }}>
              W
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-4xl font-black uppercase text-black mb-2">
                WAKA_THEODORE
              </h1>

              <div className="flex gap-3 mb-4">
                <div className="border-2 border-black bg-black text-white px-3 py-1 text-xs font-bold uppercase">
                  RANK: VETERAN
                </div>
                <div className="border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase">
                  JOINED: 2023
                </div>
              </div>

              <div className="bg-green-600 text-white px-3 py-1 text-xs font-bold uppercase inline-block">
                ✓ 5 WIN STREAK
              </div>
            </div>
          </div>

          {/* Config Button */}
          <button className="border-2 border-black bg-white px-6 py-3 font-bold uppercase text-sm" style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.6)" }}>
            ⚙️ CONFIG
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Stats */}
        <div className="col-span-2 space-y-6">
          {/* Combat Metrics */}
          <div>
            <h2 className="text-3xl font-black uppercase mb-4 text-black">
              COMBAT<br />METRICS
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Career Score */}
              <div className="border-2 border-black bg-yellow-400 p-6" style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.8)" }}>
                <div className="text-xs uppercase tracking-widest font-bold text-black mb-2">
                  🏆 CAREER SCORE
                </div>
                <div className="text-4xl font-black text-black">842,900</div>
              </div>

              {/* Matches Played */}
              <div className="border-2 border-black bg-white p-6" style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.8)" }}>
                <div className="text-xs uppercase tracking-widest font-bold text-black mb-2">
                  🎮 MATCHES PLAYED
                </div>
                <div className="text-4xl font-black text-black">342</div>
              </div>

              {/* Max Survival */}
              <div className="border-2 border-black bg-white p-6" style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.8)" }}>
                <div className="text-xs uppercase tracking-widest font-bold text-black mb-2">
                  ⏱ MAX SURVIVAL
                </div>
                <div className="text-4xl font-black text-black">4M<br />12S</div>
              </div>

              {/* Ghosts Devoured */}
              <div className="border-2 border-black bg-red-500 text-white p-6" style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.8)" }}>
                <div className="text-xs uppercase tracking-widest font-bold mb-2">
                  👻 GHOSTS DEVOURED
                </div>
                <div className="text-4xl font-black">1,204</div>
              </div>
            </div>
          </div>

          {/* Recent Operations */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-black uppercase text-black">
                RECENT<br />OPERATIONS
              </h2>
              <div className="text-xs uppercase tracking-widest font-bold text-gray-600">
                LAST 10 MATCHES
              </div>
            </div>

            <div className="space-y-2">
              {recentMatches.map((match, idx) => (
                <div key={idx} className="border-2 border-black bg-white p-4 flex items-center justify-between" style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.6)" }}>
                  <div className="flex items-center gap-4">
                    <div className={`${
                      match.result === "VICTORY"
                        ? "bg-green-600 text-white"
                        : "bg-red-500 text-white"
                    } px-3 py-1 text-xs font-bold uppercase border-2 border-black`}>
                      {match.result}
                    </div>
                    <div>
                      <div className="font-bold uppercase text-sm text-black">
                        {match.type}
                      </div>
                      <div className="text-xs text-gray-600 uppercase">
                        SURVIVED {match.survived}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-lg text-black">
                    {match.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Squad */}
        <div className="space-y-6">
          {/* Squad Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black uppercase text-black">
              👥 SQUAD
            </h2>
            <div className="border-2 border-black bg-black text-white px-2 py-1 text-xs font-bold uppercase">
              3 ONLINE
            </div>
          </div>

          {/* Recruit Button */}
          <button className="w-full arcade-button bg-yellow-400 border-2 border-black font-bold py-4 px-4 uppercase text-sm" style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.6)" }}>
            👤 RECRUIT ALLY
          </button>

          {/* Squad Members */}
          <div className="space-y-3">
            {squadMembers.map((member, idx) => (
              <div key={idx} className="border-2 border-black bg-white p-4" style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.6)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${member.color} text-white w-8 h-8 flex items-center justify-center font-bold text-sm border-2 border-black`}>
                    {member.handle.substring(0, 1)}
                  </div>
                  <div className="font-bold uppercase text-sm text-black flex-1">
                    {member.handle}
                  </div>
                  {member.status === "IN LOBBY" || member.status === "IN GAME" ? (
                    <button className="border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase hover:bg-gray-100">
                      ⚔️ CHALLENGE
                    </button>
                  ) : null}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  {member.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
