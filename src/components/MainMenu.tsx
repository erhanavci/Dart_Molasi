import { BookOpen, Play, Settings, Trophy, Users } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import GraphicAsset from "./GraphicAsset";

interface MainMenuProps {
  onStart: () => void;
  onModes: () => void;
  onLeaderboard: () => void;
  onHowTo: () => void;
  onSettings: () => void;
}

export default function MainMenu({ onStart, onModes, onLeaderboard, onHowTo, onSettings }: MainMenuProps) {
  const items = [
    { label: "Oyuna Başla", icon: <Play size={18} />, onClick: onStart, variant: "primary" as const },
    { label: "Mod Seç", icon: <Users size={18} />, onClick: onModes, variant: "secondary" as const },
    { label: "Skor Tablosu", icon: <Trophy size={18} />, onClick: onLeaderboard, variant: "secondary" as const },
    { label: "Nasıl Oynanır?", icon: <BookOpen size={18} />, onClick: onHowTo, variant: "secondary" as const },
    { label: "Ayarlar", icon: <Settings size={18} />, onClick: onSettings, variant: "ghost" as const }
  ];

  return (
    <section className="grid flex-1 place-items-center py-8">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div className="space-y-7">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-emerald-300">10 dakikalık ofis rekabeti</p>
            <GraphicAsset name="logo" label="Dart Molası" className="w-full max-w-[390px] drop-shadow-[0_0_24px_rgba(56,189,248,.45)]" />
            <p className="mt-5 max-w-2xl text-lg text-slate-200">
              Kahveni al, dartı geriye çek, parlayan hedefi yakala. Ofisteki en hızlı mola şampiyonluğu burada başlıyor.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onStart} className="transition hover:scale-105" aria-label="Oyuna Başla">
              <GraphicAsset name="playButton" className="w-48" />
            </button>
            <button onClick={onModes} className="transition hover:scale-105" aria-label="Mod Seç">
              <GraphicAsset name="modeButton" className="w-48" />
            </button>
          </div>
        </div>
        <Card className="grid gap-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">Mola Panosu</span>
            <span className="text-sm font-bold text-pink-200">Patron yaklaşıyor!</span>
          </div>
          {items.slice(2).map((item) => (
            <Button key={item.label} variant={item.variant} icon={item.icon} onClick={item.onClick} className="w-full justify-start">
              {item.label}
            </Button>
          ))}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300">
            <span className="grid place-items-center rounded-lg bg-white/10 p-2"><GraphicAsset name="combo2" className="w-24" /></span>
            <span className="grid place-items-center rounded-lg bg-white/10 p-2"><GraphicAsset name="coinGold" className="w-14" /></span>
            <span className="grid place-items-center rounded-lg bg-white/10 p-2"><GraphicAsset name="postit" className="w-14" /></span>
          </div>
        </Card>
      </div>
    </section>
  );
}
