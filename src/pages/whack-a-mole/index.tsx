import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import GameBoard from "./components/GameBoard.tsx";
import Home from "./components/Home.tsx";
import AnimatedBackground from "./components/AnimatedBackground.tsx";
import NightmareBackground from "./components/NightmareBackground.tsx";
import { useGameAudio } from "./hooks/useGameAudio.ts";
import "./whack-a-mole.css";
import "./nightmare-mode.css";

interface GameData {
  name?: string;
  description?: string;
}

function WhackAMoleGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<"home" | "game">("home");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNightmareMode, setIsNightmareMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize audio system
  const { isMuted, toggleMute } = useGameAudio({
    isNightmareMode,
    isPlaying,
    isPaused,
    isOnHomeScreen: view === "home", // Pass home screen state
  });

  // Fetch game data from backend
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Use the correct whack-a-mole specific endpoint
        const response = await api.get(
          `/api/game/game-type/whack-a-mole/${gameId}/play/public`,
        );
        setGameData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch game data:", error);
        // Set dummy data for testing if fetch fails
        setGameData({
          name: "Whack-a-Robo (Test Mode)",
          description: "Test mode - Backend not connected",
        });
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameData();
    } else {
      // Allow testing without gameId
      setGameData({
        name: "Whack-a-Robo (Demo)",
        description: "Demo mode - No backend required",
      });
      setLoading(false);
    }
  }, [gameId]);

  // Handle exit from game board - return to game home screen
  const handleExitGame = async () => {
    if (gameId) {
      try {
        // Note: This endpoint might not exist yet, which is okay
        await api.post(
          `/api/game/game-type/whack-a-mole/${gameId}/play/public`,
        );
      } catch {
        // Silently fail - play count update is not critical for gameplay
        // console.log("Play count update skipped (endpoint may not be implemented)");
      }
    }
    // Stop music and return to game home screen
    setIsPlaying(false);
    setIsPaused(false);
    setView("home");
  };

  // Handle back to main homepage
  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="text-green-500 font-mono text-lg animate-pulse">
          LOADING GAME DATA...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`whack-a-mole-container fixed inset-0 w-full h-full flex flex-col items-center font-['Fredoka'] overflow-y-auto transition-colors duration-700 ${
        isNightmareMode
          ? "bg-red-950 text-red-100 selection:bg-red-600 selection:text-black"
          : "bg-slate-950 text-slate-200 selection:bg-green-500 selection:text-black"
      }`}
    >
      {/* Animated Background Component */}
      <AnimatedBackground />
      <NightmareBackground isActive={isNightmareMode} />

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className={`fixed bottom-6 left-6 z-50 group flex items-center justify-center w-12 h-12
          bg-slate-900/80 border rounded-full backdrop-blur-sm transition-all duration-300 ${
            isNightmareMode
              ? "border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
              : "border-slate-500/50 text-slate-400 hover:bg-slate-700 hover:border-slate-400"
          }`}
        title={isMuted ? "Unmute Music" : "Mute Music"}
      >
        {isMuted ? (
          <span className="text-xl">🔇</span>
        ) : (
          <span className="text-xl">🔊</span>
        )}
      </button>

      {/* Content Container dengan padding untuk scroll */}
      <div className="relative z-10 w-full flex flex-col items-center py-12 px-4 min-h-full">
        {/* --- LOGIKA PERPINDAHAN HALAMAN --- */}
        {view === "home" ? (
          <>
            {/* BACK TO MAIN HOMEPAGE BUTTON */}
            <button
              onClick={handleBackToHome}
              className="fixed top-6 left-6 z-50 group flex items-center gap-3 px-5 py-3 
            bg-slate-900/80 border border-slate-500/50 text-slate-400 font-mono text-xs tracking-widest uppercase rounded-sm backdrop-blur-sm
            hover:bg-slate-700 hover:text-white hover:border-slate-400 transition-all duration-300"
            >
              <span className="text-lg group-hover:-translate-x-1 transition-transform">
                ←
              </span>
              BACK_TO_HOME
            </button>

            <Home
              onStart={() => {
                setView("game");
                // isPlaying will be set by GameBoard's startGame()
              }}
              gameData={gameData ?? undefined}
              isNightmareMode={isNightmareMode}
              onToggleMode={() => setIsNightmareMode(!isNightmareMode)}
            />
          </>
        ) : (
          <>
            {/* EXIT BUTTON (FIXED POSITION) - Return to game home */}
            <button
              onClick={handleExitGame}
              className="fixed top-6 left-6 z-50 group flex items-center gap-3 px-5 py-3 
            bg-slate-900/80 border border-red-500/50 text-red-400 font-mono text-xs tracking-widest uppercase rounded-sm backdrop-blur-sm
            hover:bg-red-500 hover:text-black hover:border-red-500 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <span className="text-lg group-hover:-translate-x-1 transition-transform">
                «
              </span>
              EXIT_GAME
            </button>

            <GameBoard
              onExit={handleExitGame}
              gameData={gameData ?? undefined}
              isNightmareMode={isNightmareMode}
              isPlaying={isPlaying}
              isPaused={isPaused}
              onPlayingChange={setIsPlaying}
              onPausedChange={setIsPaused}
            />
          </>
        )}

        {/* Footer */}
        <p className="fixed bottom-4 text-slate-600 text-[10px] font-mono opacity-50 z-10 pointer-events-none">
          SECURE_CONNECTION_ESTABLISHED | WORDIT_GAME_SYSTEM
        </p>
      </div>
    </div>
  );
}

export default WhackAMoleGame;
