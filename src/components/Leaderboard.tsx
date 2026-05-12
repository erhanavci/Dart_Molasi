import { Trash2, ArrowLeft } from "lucide-react";
import type { GameMode, LeaderboardEntry } from "../types/game";
import { formatDate, modeName } from "../utils/formatters";
import Button from "./Button";
import Card from "./Card";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onClear: () => void;
  onBack: () => void;
}

export default function Leaderboard({ entries, onClear, onBack }: LeaderboardProps) {
  const grouped = entries.reduce<Record<GameMode, LeaderboardEntry[]>>(
    (acc, entry) => {
      acc[entry.mode].push(entry);
      return acc;
    },
    { quick201: [], bullRush: [], officeDuel: [], bossComing: [] }
  );

  return (
    <section className="flex flex-1 flex-col py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black">Skor Tablosu</h2>
          <p className="text-slate-300">Bugünün En İyileri ve Tüm Zamanlar kayıtları bu cihazda tutulur.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" icon={<Trash2 size={17} />} onClick={onClear}>Skorları Temizle</Button>
          <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>Menüye Dön</Button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {(Object.keys(grouped) as GameMode[]).map((mode) => (
          <Card key={mode}>
            <h3 className="mb-4 text-xl font-black">{modeName(mode)}</h3>
            <div className="space-y-2">
              {grouped[mode].slice(0, 8).map((entry, index) => (
                <div key={entry.id} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-xl bg-slate-950/40 p-3">
                  <span className="text-lg font-black text-amber-200">#{index + 1}</span>
                  <div>
                    <div className="font-black">{entry.playerName}</div>
                    <div className="text-xs text-slate-400">
                      {formatDate(entry.date)} · Kombo x{entry.maxCombo} · Bull {entry.bullseyes} · %{entry.accuracy}
                    </div>
                  </div>
                  <strong className="text-emerald-200">{entry.score}</strong>
                </div>
              ))}
              {grouped[mode].length === 0 && <div className="rounded-xl bg-white/10 p-4 text-slate-300">Henüz skor yok. İlk molayı sen aç.</div>}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
