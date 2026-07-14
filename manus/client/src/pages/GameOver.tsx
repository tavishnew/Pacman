/**
 * Game Over Screen - Brutalist Arcade UI
 * Matches: GameOver-Brutalist.png design
 * 
 * Design notes:
 * - Split layout: left yellow poster panel, right results panel
 * - Giant GAME OVER text on yellow background
 * - Results table with top 4 players
 * - Score breakdown with progress bars
 */

const matchResults = [
  { rank: 1, handle: "GHOST_KILL3R", status: "ALIVE", score: 18900 },
  { rank: 2, handle: "WAKA_THEODORE", status: "DEAD", score: 14250, isCurrentUser: true },
  { rank: 3, handle: "CHERRY_POPPER", status: "DEAD", score: 12100 },
  { rank: 4, handle: "BLINKY_BLIND", status: "DEAD", score: 9500 },
];

const scoreBreakdown = [
  { label: "PELLETS EATEN", icon: "🟡", value: 8400, max: 10000 },
  { label: "GHOSTS DEVOURED", icon: "👻", value: 4800, max: 10000 },
  { label: "SURVIVAL BONUS", icon: "💚", value: 1050, max: 5000 },
];

export default function GameOver() {
  return (
    <div className="min-h-screen bg-amber-50 p-8 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Left Panel - Game Over */}
        <div className="border-2 border-black bg-yellow-400 p-12 flex flex-col justify-between" style={{ boxShadow: "6px 6px 0px rgba(0,0,0,0.8)" }}>
          {/* Header Badge */}
          <div className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-bold uppercase inline-block mb-8 w-fit">
            MATCH TERMINATED
          </div>

          {/* Sector Info */}
          <div className="text-sm font-bold uppercase tracking-widest text-black mb-12">
            SECTOR 7G
          </div>

          {/* Main Text */}
          <div className="mb-12">
            <h1 className="text-8xl font-black uppercase leading-none text-black mb-8">
              GAME<br />OVER
            </h1>
          </div>

          {/* Final Score Box */}
          <div className="border-2 border-black bg-white p-6 mb-8">
            <div className="text-xs uppercase tracking-widest font-bold text-black mb-2">
              FINAL SCORE
            </div>
            <div className="text-6xl font-black text-black">
              14,250
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 arcade-button bg-white border-2 border-black font-bold py-4 px-6 uppercase text-sm" style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.6)" }}>
              🔄 REMATCH
            </button>
            <button className="flex-1 arcade-button bg-white border-2 border-black font-bold py-4 px-6 uppercase text-sm" style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.6)" }}>
              LOBBY
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="border-2 border-black bg-white p-8" style={{ boxShadow: "6px 6px 0px rgba(0,0,0,0.8)" }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-black">
            <h2 className="text-3xl font-black uppercase text-black">
              MATCH<br />RESULTS
            </h2>
            <div className="text-xs uppercase tracking-widest font-bold text-black">
              TOP 4
            </div>
          </div>

          {/* Results Table */}
          <div className="space-y-3 mb-8">
            {matchResults.map((result) => (
              <div
                key={result.rank}
                className={`border-2 border-black p-4 flex items-center justify-between ${
                  result.isCurrentUser ? "bg-yellow-400" : result.rank === 1 ? "bg-black text-white" : "bg-white"
                }`}
                style={result.isCurrentUser || result.rank === 1 ? { boxShadow: "2px 2px 0px rgba(0,0,0,0.6)" } : {}}
              >
                <div className="flex items-center gap-4">
                  <div className="font-bold text-lg w-8">
                    {result.rank}
                  </div>
                  <div>
                    <div className="font-bold uppercase text-sm">
                      {result.handle}
                    </div>
                    {result.status && (
                      <div className={`text-xs uppercase font-bold ${
                        result.status === "ALIVE"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {result.status}
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-bold text-lg">
                  {result.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Score Breakdown */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-4 pb-4 border-b-2 border-black">
              SCORE BREAKDOWN
            </h3>

            <div className="space-y-4">
              {scoreBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs uppercase tracking-widest font-bold text-black">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-bold text-black">
                      +{item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 border-2 border-black h-3">
                    <div
                      className={`h-full ${
                        idx === 0
                          ? "bg-yellow-400"
                          : idx === 1
                          ? "bg-red-500"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
