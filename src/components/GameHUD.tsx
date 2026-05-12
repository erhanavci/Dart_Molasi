import { Send, RotateCcw, StepForward, Home } from "lucide-react";
import type { ActivePowerUp, PlayerState } from "../types/game";
import { formatTime } from "../utils/formatters";
import Button from "./Button";
import Card from "./Card";

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
          <div className="text-sm text-slate-300">{activePowerUps.map((item) => item.label).join(" · ") || "Aktif bonus yok"}</div>
        </div>
      </div>
      {showBossAlarm && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-950/25 p-3">
          <div className="mb-2 flex justify-between text-sm font-black">
            <span>Patron Alarmı</span>
            <span>{Math.round(bossAlarm)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-950">
            <div className="h-full bg-gradient-to-r from-yellow-300 to-rose-500 transition-all" style={{ width: `${bossAlarm}%` }} />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button icon={<Send size={19} />} onClick={onThrowButton} disabled={phase !== "playing"} className="w-12 px-0" aria-label="At" title="At" />
        <Button variant="secondary" icon={<StepForward size={19} />} onClick={onNextTurn} disabled={phase !== "betweenTurns"} className="w-12 px-0" aria-label="Sonraki Tur" title="Sonraki Tur" />
        <Button variant="secondary" icon={<RotateCcw size={19} />} onClick={onRestart} className="w-12 px-0" aria-label="Tekrar Oyna" title="Tekrar Oyna" />
        <Button variant="ghost" icon={<Home size={19} />} onClick={onMenu} className="w-12 px-0" aria-label="Menüye Dön" title="Menüye Dön" />
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
