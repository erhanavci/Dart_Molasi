import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import type { SettingsState } from "../types/game";
import Button from "./Button";
import Card from "./Card";

interface SettingsProps {
  settings: SettingsState;
  onChange: (settings: SettingsState) => void;
  onBack: () => void;
}

export default function Settings({ settings, onChange, onBack }: SettingsProps) {
  return (
    <section className="grid flex-1 place-items-center py-6">
      <Card className="w-full max-w-xl">
        <h2 className="text-3xl font-black">Ayarlar</h2>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-black text-slate-300">Oyuncu adı</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 font-bold text-white outline-none ring-emerald-300/40 focus:ring-4"
              value={settings.playerName}
              onChange={(event) => onChange({ ...settings, playerName: event.target.value || "Oyuncu" })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Ses" active={settings.sound} onClick={() => onChange({ ...settings, sound: !settings.sound })} />
            <Toggle label="Efektler" active={settings.effects} onClick={() => onChange({ ...settings, effects: !settings.effects })} />
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <div className="text-sm font-black text-slate-300">Dil</div>
            <div className="mt-1 text-xl font-black">Türkçe</div>
          </div>
        </div>
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack} className="mt-6">Menüye Dön</Button>
      </Card>
    </section>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between rounded-xl border p-4 font-black transition ${active ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-100" : "border-white/10 bg-white/10 text-slate-300"}`}>
      {label}
      {active ? <Volume2 size={19} /> : <VolumeX size={19} />}
    </button>
  );
}
