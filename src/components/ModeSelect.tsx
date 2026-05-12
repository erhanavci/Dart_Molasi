import { ArrowLeft, Play } from "lucide-react";
import { GAME_MODES, modeOrder } from "../game/GameModes";
import type { GameMode } from "../types/game";
import Button from "./Button";
import Card from "./Card";

export default function ModeSelect({ onSelect, onBack }: { onSelect: (mode: GameMode) => void; onBack: () => void }) {
  const descriptions: Record<GameMode, string> = {
    quick201: "201'den sıfıra in. Hızlı düşün, temiz bitir.",
    bullRush: "90 saniyede en yüksek skoru yap. Hareketli Bull'u yakala.",
    officeDuel: "Aynı ekranda arkadaşına meydan oku.",
    bossComing: "Alarm dolmadan en yüksek skoru yap."
  };

  return (
    <section className="flex flex-1 flex-col py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black">Mod Seç</h2>
          <p className="text-slate-300">Bugünkü molanın ritmini seç.</p>
        </div>
        <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={onBack}>Menüye Dön</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modeOrder.map((mode) => (
          <Card key={mode} className="group flex min-h-64 flex-col justify-between transition duration-200 hover:-translate-y-1 hover:border-emerald-300/50 hover:shadow-neon">
            <div>
              <h3 className="text-2xl font-black">{GAME_MODES[mode].title}</h3>
              <p className="mt-3 text-slate-200">{descriptions[mode]}</p>
            </div>
            <Button icon={<Play size={17} />} onClick={() => onSelect(mode)} className="mt-6 w-full">Bu Modu Oyna</Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
