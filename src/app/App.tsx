import { useEffect, useMemo, useState } from "react";
import GameHUD from "../components/GameHUD";
import HowToPlay from "../components/HowToPlay";
import Layout from "../components/Layout";
import Leaderboard from "../components/Leaderboard";
import MainMenu from "../components/MainMenu";
import ModeSelect from "../components/ModeSelect";
import ResultScreen from "../components/ResultScreen";
import Settings from "../components/Settings";
import Splash from "../components/Splash";
import { defaultSettings, normalizeSettings } from "../game/GameState";
import { GAME_MODES } from "../game/GameModes";
import ThreeDartGame from "../game/ThreeDartGame";
import { useGameState } from "../hooks/useGameState";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { GameMode, GameResult, LeaderboardEntry, PlayerProfile } from "../types/game";

type Screen = "splash" | "menu" | "modes" | "game" | "result" | "leaderboard" | "howto" | "settings";

export default function App() {
  const [settings, setSettings] = useLocalStorage("dart-molasi-settings", defaultSettings);
  const safeSettings = useMemo(() => normalizeSettings(settings), [settings]);
  const [leaderboard, setLeaderboard] = useLocalStorage<LeaderboardEntry[]>("dart-molasi-leaderboard", []);
  const [screen, setScreen] = useState<Screen>("splash");
  const [mode, setMode] = useState<GameMode>(safeSettings.defaultMode);
  const [gameKey, setGameKey] = useState(0);
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const [lastResult, setLastResult] = useState<GameResult | undefined>();
  const [throwSignal, setThrowSignal] = useState(0);

  const sortedLeaderboard = useMemo(
    () => [...leaderboard].sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime()),
    [leaderboard]
  );

  const saveScore = (entry: LeaderboardEntry) => {
    setLeaderboard((current) => [entry, ...current].slice(0, 120));
  };

  const startMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setGameKey((value) => value + 1);
    setPower(0);
    setCharging(false);
    setLastResult(undefined);
    setScreen("game");
  };

  const restart = () => {
    setGameKey((value) => value + 1);
    setPower(0);
    setCharging(false);
    setLastResult(undefined);
    setScreen("game");
  };

  return (
    <Layout>
      {screen === "splash" && <Splash onStart={() => setScreen("menu")} />}
      {screen === "menu" && (
        <MainMenu
          onStart={() => startMode(safeSettings.defaultMode)}
          onModes={() => setScreen("modes")}
          onLeaderboard={() => setScreen("leaderboard")}
          onHowTo={() => setScreen("howto")}
          onSettings={() => setScreen("settings")}
        />
      )}
      {screen === "modes" && <ModeSelect onSelect={startMode} onBack={() => setScreen("menu")} />}
      {screen === "leaderboard" && <Leaderboard entries={sortedLeaderboard} onClear={() => setLeaderboard([])} onBack={() => setScreen("menu")} />}
      {screen === "howto" && <HowToPlay onBack={() => setScreen("menu")} />}
      {screen === "settings" && <Settings settings={safeSettings} onChange={setSettings} onBack={() => setScreen("menu")} />}
      {screen === "game" && (
        <GameView
          key={gameKey}
          mode={mode}
          settingsPlayerName={safeSettings.playerName}
          playerProfiles={safeSettings.players}
          onSaveScore={saveScore}
          onResult={(result) => {
            setLastResult(result);
            setScreen("result");
          }}
          onMenu={() => setScreen("menu")}
          onRestart={restart}
          power={power}
          charging={charging}
          throwSignal={throwSignal}
          onThrowButton={() => setThrowSignal((value) => value + 1)}
          onPowerChange={(value, isCharging) => {
            setPower(value);
            setCharging(isCharging);
          }}
        />
      )}
      {screen === "result" && lastResult && (
        <ResultScreen
          result={lastResult}
          onRestart={restart}
          onModes={() => setScreen("modes")}
          onLeaderboard={() => setScreen("leaderboard")}
          onMenu={() => setScreen("menu")}
        />
      )}
    </Layout>
  );
}

interface GameViewProps {
  mode: GameMode;
  settingsPlayerName: string;
  playerProfiles: PlayerProfile[];
  onSaveScore: (entry: LeaderboardEntry) => void;
  onResult: (result: GameResult) => void;
  onMenu: () => void;
  onRestart: () => void;
  power: number;
  charging: boolean;
  throwSignal: number;
  onThrowButton: () => void;
  onPowerChange: (power: number, charging: boolean) => void;
}

function GameView({
  mode,
  settingsPlayerName,
  playerProfiles,
  onSaveScore,
  onResult,
  onMenu,
  onRestart,
  power,
  charging,
  throwSignal,
  onThrowButton,
  onPowerChange
}: GameViewProps) {
  const game = useGameState({ mode, playerName: settingsPlayerName, playerProfiles, onSaveScore });
  const currentPlayer = game.players[game.activePlayer];
  const dartsLeft = Math.max(0, (game.suddenDeath ? 1 : GAME_MODES[mode].dartsPerTurn) - game.turnDarts);

  useEffect(() => {
    if (game.phase === "finished" && game.result) {
      const timer = window.setTimeout(() => onResult(game.result as GameResult), 350);
      return () => window.clearTimeout(timer);
    }
  }, [game.phase, game.result, onResult]);

  return (
    <section className={`grid flex-1 gap-4 py-4 xl:grid-cols-[420px_1fr] ${mode === "bossComing" && game.bossAlarm > 78 ? "animate-shake" : ""}`}>
      <div className="order-2 xl:order-1">
        <GameHUD
          modeTitle={GAME_MODES[mode].title}
          player={currentPlayer}
          timeLeft={game.timeLeft}
          showTimer={Boolean(GAME_MODES[mode].seconds)}
          combo={currentPlayer.combo}
          activePowerUps={game.powerUps}
          bossAlarm={game.bossAlarm}
          showBossAlarm={mode === "bossComing"}
          dartsLeft={dartsLeft}
          power={power}
          charging={charging}
          phase={game.phase}
          bonusText={game.bonusText}
          onNextTurn={game.nextTurn}
          onThrowButton={onThrowButton}
          onRestart={onRestart}
          onMenu={onMenu}
        />
      </div>
      <div className="order-1 flex min-h-[520px] flex-col items-center justify-center xl:order-2">
        <div className="relative w-full">
          <ThreeDartGame
            bonusTarget={game.bonusTarget}
            comboMultiplier={currentPlayer.combo}
            bullOffset={game.bullOffset}
            goldenBull={game.goldenBull}
            powerUps={game.powerUps}
            disabled={game.phase !== "playing"}
            throwSignal={throwSignal}
            onThrow={game.handleThrow}
            onPowerChange={onPowerChange}
          />
          <div className="pointer-events-none absolute left-1/2 top-5 flex -translate-x-1/2 flex-col items-center gap-2">
            {game.events.map((event) => (
              <div
                key={event.id}
                className={`animate-score-pop rounded-full px-4 py-2 text-sm font-black shadow-2xl ${
                  event.tone === "warning"
                    ? "bg-rose-500 text-white"
                    : event.tone === "bonus"
                      ? "bg-amber-300 text-slate-950"
                      : event.tone === "combo"
                        ? "bg-pink-400 text-slate-950"
                        : "bg-emerald-300 text-slate-950"
                }`}
              >
                {event.text}
              </div>
            ))}
          </div>
        </div>
        {game.phase === "betweenTurns" && (
          <div className="mt-4 rounded-full border border-amber-300/30 bg-amber-300/15 px-5 py-3 text-center font-black text-amber-100">
            {game.suddenDeath ? "Ani Ölüm!" : mode === "officeDuel" ? "Sonraki Oyuncu" : "Sonraki Tur"}
          </div>
        )}
      </div>
    </section>
  );
}
