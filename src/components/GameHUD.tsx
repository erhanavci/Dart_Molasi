import { StepForward } from "lucide-react";
import type { ActivePowerUp, PlayerState } from "../types/game";
import { formatTime } from "../utils/formatters";
import Button from "./Button";
import Card from "./Card";
import GraphicAsset from "./GraphicAsset";

interface GameHUDProps {
  modeTitle: string;
  player: PlayerState;
  timeLeft: number;
  showTimer: boolean;
  combo: number;
  activePowerUps: ActivePowerUp[];
  bossAlarm: number;
  showBossAlarm: boolean;
  dartsLeft: number;
  power: number;
  charging: boolean;
  phase: "playing" | "betweenTurns" | "finished";
  bonusText?: string;
  onNextTurn: () => void;
  onThrowButton: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameHUD({
  modeTitle,
  player,
  timeLeft,
  showTimer,
  combo,
  activePowerUps,
  bossAlarm,
  showBossAlarm,
  dartsLeft,
  power,
  charging,
  phase,
  bonusText,
  onNextTurn,
  onThrowButton,
  onRestart,
  onMenu
}: GameHUDProps) {
  const score = player.remainingScore !== undefined ? `${player.remainingScore} kaldı` : player.score;

  return (
    <Card className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-xl bg-slate-950/40 p-3">
          <div className="text-xs font-black uppercase text-slate-400">Skor Paneli</div>
          <div className="mt-1 flex items-center gap-3">
            <GraphicAsset name="diamond" className="w-14 shrink-0" />
            <div>
              <div className="text-3xl font-black text-cyan-100">{score}</div>
              <div className="text-xs font-bold text-slate-400">{modeTitle}</div>
            </div>
          </div>
        </div>
        {combo > 1 && <GraphicAsset name={combo >= 3 ? "combo3" : "combo2"} className="mx-auto w-36" />}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Mod" value={modeTitle} />
        <Metric label="Oyuncu" value={`${player.avatar ?? "☕"} ${player.name}`} />
        <Metric label="Skor" value={score} pulse />
        <Metric label="Süre" value={showTimer ? formatTime(timeLeft) : "Tur oyunu"} />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-black uppercase text-slate-300">
            <span>Güç</span>
            <span>{charging ? "Bırak ve at" : "Basılı tut"}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-950/70">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-pink-400 transition-all" style={{ width: `${Math.round(power * 100)}%` }} />
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs font-black uppercase text-slate-300">Dart Hakkı</div>
          <div className="mt-2 flex gap-2">
            {Array.from({ length: Math.max(0, dartsLeft) }).map((_, index) => (
              <span key={index} className="h-4 flex-1 rounded-full bg-emerald-300 shadow-neon" />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-xs font-black uppercase text-slate-300">Kombo / Bonus</div>
          <div className="mt-1 font-black text-amber-200">{combo > 1 ? `Kombo x${combo}` : bonusText ?? "Bonus Hedef!"}</div>
          <div className="mt-2 flex min-h-12 items-center gap-2">
            {activePowerUps.length > 0 ? (
              activePowerUps.map((item) => <GraphicAsset key={`${item.type}-${item.expiresAt ?? "instant"}`} name={powerUpGraphics[item.type]} className="h-12 w-12" label={item.label} />)
            ) : (
              <span className="text-sm text-slate-300">Aktif bonus yok</span>
            )}
          </div>
        </div>
      </div>
      {showBossAlarm && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-950/25 p-3">
          <GraphicAsset name="bossAlert" className="mb-2 w-44" />
          <div className="mb-2 flex justify-between text-sm font-black">
            <span>Patron Alarmı</span>
            <span>{Math.round(bossAlarm)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-950">
            <div className="h-full bg-gradient-to-r from-yellow-300 to-rose-500 transition-all" style={{ width: `${bossAlarm}%` }} />
          </div>
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={onThrowButton} disabled={phase !== "playing"} className="transition enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40" aria-label="At">
          <GraphicAsset name="playButton" className="w-full" />
        </button>
        <Button variant="secondary" icon={<StepForward size={19} />} onClick={onNextTurn} disabled={phase !== "betweenTurns"} className="min-h-16 text-base">
          Sonraki Tur
        </Button>
        <button type="button" onClick={onRestart} className="transition hover:scale-[1.03]" aria-label="Tekrar Oyna">
          <GraphicAsset name="replayButton" className="w-full" />
        </button>
        <button type="button" onClick={onMenu} className="transition hover:scale-[1.03]" aria-label="Menüye Dön">
          <GraphicAsset name="homeButton" className="w-full" />
        </button>
      </div>
    </Card>
  );
}

function Metric({ label, value, pulse }: { label: string; value: string | number; pulse?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-950/40 p-3">
      <div className="text-xs font-black uppercase text-slate-400">{label}</div>
      <div className={`mt-1 text-xl font-black ${pulse ? "animate-soft-pulse text-emerald-200" : "text-white"}`}>{value}</div>
    </div>
  );
}

const powerUpGraphics: Record<ActivePowerUp["type"], "coffee" | "focus" | "meeting" | "postit"> = {
  coffeeBoost: "coffee",
  focusMode: "focus",
  meetingCancelled: "meeting",
  luckyPostIt: "postit"
};
