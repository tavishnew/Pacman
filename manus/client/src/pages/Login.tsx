import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Login Screen - Brutalist Arcade UI
 * Matches: Login-Brutalist.png design
 * 
 * Design notes:
 * - Split layout: left side branding, right side auth form
 * - Heavy borders and drop shadows throughout
 * - Monospaced typography for all labels and data
 * - Yellow accent color for primary actions
 * - Off-white background with black text
 */

export default function Login() {
  const [isNewPlayer, setIsNewPlayer] = useState(false);
  const [handle, setHandle] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { handle, passcode, isNewPlayer });
    // TODO: Connect to actual auth API
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-8">
      <div className="grid grid-cols-2 gap-12 max-w-6xl w-full">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-widest text-black mb-2">
              SYS.ONLINE
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-black">
              LOC: US-EAST-1
            </div>
          </div>

          <h1 className="text-7xl font-black leading-none mb-12 text-black">
            PAC<br />MULTI
          </h1>

          {/* Info Box */}
          <div className="border-2 border-black p-6 mb-8 bg-white" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
            <div className="text-sm font-bold uppercase tracking-wide text-black mb-4 pb-4 border-b-2 border-black">
              COMPETITIVE ARENA ACTION.
              <br />
              LIVE GHOST HUNTERS.
              <br />
              ZERO QUARTERS REQUIRED.
            </div>

            <div className="flex gap-4 mt-4">
              <div className="border-2 border-black px-3 py-2 bg-white text-xs font-bold uppercase">
                👻 CHASERS ACTIVE
              </div>
              <div className="border-2 border-black px-3 py-2 bg-white text-xs font-bold uppercase">
                🚫 NO BOTS ALLOWED
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="border-t-2 border-black pt-6">
            <div className="text-xs uppercase tracking-widest text-black font-bold mb-2">
              CURRENT CHAMPION
            </div>
            <div className="font-bold text-black mb-4">
              WAKA_THEODORE // 48,200
            </div>
            <div className="text-xs uppercase tracking-widest text-black font-bold mb-2">
              ACTIVE LOBBIES
            </div>
            <div className="font-bold text-black">
              14 REGION: NA-EAST
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex flex-col justify-center">
          {/* Tab Header */}
          <div className="flex mb-6 border-2 border-black" style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.8)" }}>
            <button
              onClick={() => setIsNewPlayer(false)}
              className={`flex-1 py-3 px-4 font-bold uppercase text-xs tracking-widest border-r-2 border-black transition-colors ${
                !isNewPlayer
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              INSERT COIN
            </button>
            <button
              onClick={() => setIsNewPlayer(true)}
              className={`flex-1 py-3 px-4 font-bold uppercase text-xs tracking-widest transition-colors ${
                isNewPlayer
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              NEW PLAYER
            </button>
          </div>

          {/* Form Container */}
          <div className="border-2 border-black p-8 bg-white" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
            <h2 className="text-xl font-bold uppercase mb-2 text-black">
              PLAYER AUTHENTICATION
            </h2>
            <p className="text-sm text-black mb-6">
              Enter credentials to access the multiplayer grid.
            </p>

            <div className="border-b-2 border-black mb-6"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Handle Input */}
              <div>
                <label className="arcade-label block mb-2">HANDLE</label>
                <input
                  type="text"
                  placeholder="E.G. BLINKY_BANE"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full border-2 border-black p-3 font-mono text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Passcode Input */}
              <div>
                <label className="arcade-label block mb-2">PASSCODE</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full border-2 border-black p-3 font-mono text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full arcade-button bg-yellow-400 text-black border-2 border-black font-bold py-4 px-6 uppercase text-sm tracking-widest"
                style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.6)" }}
              >
                START GAME →
              </button>
            </form>

            {/* Recovery Link */}
            <div className="text-center mt-6 pt-6 border-t-2 border-black">
              <a href="#" className="text-xs uppercase tracking-widest text-black hover:underline font-bold">
                RECOVER LOST PASSCODE
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
