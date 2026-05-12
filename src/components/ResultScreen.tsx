import { Home, ListRestart, Trophy } from "lucide-react";
import type { GameResult } from "../types/game";
import { formatTime, modeName } from "../utils/formatters";
import Button from "./Button";
import Card from "./Card";

interface ResultScreenProps {
  result: GameResult;
  onRestart: () => void;
  onModes: () => void;
  onLeaderboard: () => void;
  onMenu: () => void;
}

export default function ResultScreen({ result, onRestart, onModes, onLeaderboard, onMenu }: ResultScreenProps) {
  const stats = [
    ["Toplam skor", result.totalScore],
    ["En iyi atış", result.bestThrow],
    ["Bullseye sayısı", result.bullseyes],
    ["En yüksek kombo", `x${result.maxCombo}`],
    ["İsabet oranı", `%${result.accuracy}`],
    ["Oynanan mod", modeName(result.mode)],
    ["Süre", formatTime(result.durationSeconds)]
  ];

  return (
    <section className="grid flex-1 place-items-center py-6">
      <Card className="w-full max-w-3xl text-center">
        <Trophy className="mx-auto mb-4 text-amber-300" size={54} />
        <h2 className="text-4xl font-black">{result.title}</h2>
        <p className="mt-2 text-slate-300">Kazanan mola performansı: {result.playerName}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-950/50 p-4 text-left">
              <div className="text-xs font-black uppercase text-slate-400">{label}</div>
              <div className="mt-1 text-2xl font-black text-white">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button icon={<ListRestart size={17} />} onClick={onRestart}>Tekrar Oyna</Button>
          <Button variant="secondary" onClick={onModes}>Yeni Mod Seç</Button>
          <Button variant="secondary" onClick={onLeaderboard}>Skor Tablosuna Bak</Button>
          <Button variant="ghost" icon={<Home size={17} />} onClick={onMenu}>Menüye Dön</Button>
        </div>
      </Card>
    </section>
  );
}
