import { ArrowLeft, Plus, Trash2, Volume2, VolumeX } from "lucide-react";
import { avatarChoices } from "../game/GameState";
import type { SettingsState } from "../types/game";
import Button from "./Button";
import Card from "./Card";

interface SettingsProps {
  settings: SettingsState;
  onChange: (settings: SettingsState) => void;
  onBack: () => void;
}

export default function Settings({ settings, onChange, onBack }: SettingsProps) {
  const updatePlayer = (index: number, name: string, avatar = settings.players[index]?.avatar ?? avatarChoices[0]) => {
    const players = [...settings.players];
    players[index] = { ...players[index], id: players[index]?.id ?? `player-${index + 1}`, name, avatar };
    onChange({ ...settings, playerName: players[0]?.name ?? "Oyuncu", players });
  };

  const addPlayer = () => {
    const nextIndex = settings.players.length;
    onChange({
      ...settings,
      players: [...settings.players, { id: `player-${Date.now()}`, name: `Oyuncu ${nextIndex + 1}`, avatar: avatarChoices[nextIndex % avatarChoices.length] }]
    });
  };

  const removePlayer = (index: number) => {
    const players = settings.players.filter((_, playerIndex) => playerIndex !== index);
    onChange({ ...settings, playerName: players[0]?.name ?? "Oyuncu", players: players.length ? players : settings.players });
  };

  return (
    <section className="grid flex-1 place-items-center py-6">
      <Card className="w-full max-w-3xl">
        <h2 className="text-3xl font-black">Ayarlar</h2>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-black text-slate-300">Oyuncu adı</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 font-bold text-white outline-none ring-emerald-300/40 focus:ring-4"
              value={settings.playerName}
              onChange={(event) => {
                const name = event.target.value || "Oyuncu";
                const players = [...settings.players];
                players[0] = { ...players[0], name };
                onChange({ ...settings, playerName: name, players });
              }}
            />
          </label>
          <div className="rounded-xl bg-white/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-300">Oyuncular ve Avatarlar</div>
                <div className="text-xs text-slate-400">Ofis Düellosu ilk iki profili kullanır.</div>
              </div>
              <Button type="button" icon={<Plus size={17} />} onClick={addPlayer} className="px-3">Ekle</Button>
            </div>
            <div className="space-y-3">
              {settings.players.map((player, index) => (
                <div key={player.id} className="grid gap-2 rounded-xl bg-slate-950/40 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <div className="flex gap-2">
                    {avatarChoices.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        className={`grid h-10 w-10 place-items-center rounded-full border text-lg transition hover:scale-105 ${
                          player.avatar === avatar ? "border-emerald-300 bg-emerald-300/20" : "border-white/10 bg-white/10"
                        }`}
                        onClick={() => updatePlayer(index, player.name, avatar)}
                        aria-label={`${avatar} avatar`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 font-bold text-white outline-none ring-emerald-300/40 focus:ring-4"
                    value={player.name}
                    onChange={(event) => updatePlayer(index, event.target.value || `Oyuncu ${index + 1}`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    icon={<Trash2 size={17} />}
                    onClick={() => removePlayer(index)}
                    disabled={settings.players.length <= 1}
                    aria-label="Oyuncuyu sil"
                  />
                </div>
              ))}
            </div>
          </div>
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
