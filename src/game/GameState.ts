import type { GameMode, PlayerProfile, PlayerState, SettingsState } from "../types/game";

export const avatarChoices = ["☕", "💼", "📌", "📊", "🎧", "⚡"];

export const defaultPlayers: PlayerProfile[] = [
  { id: "player-1", name: "Oyuncu", avatar: "☕" },
  { id: "player-2", name: "Yan Masa", avatar: "💼" }
];

export const defaultSettings: SettingsState = {
  playerName: "Oyuncu",
  players: defaultPlayers,
  defaultMode: "bullRush",
  sound: true,
  effects: true,
  language: "Türkçe"
};

export const normalizeSettings = (settings: Partial<SettingsState>): SettingsState => ({
  ...defaultSettings,
  ...settings,
  players:
    settings.players && settings.players.length > 0
      ? settings.players.map((player, index) => ({
          id: player.id || `player-${index + 1}`,
          name: player.name || `Oyuncu ${index + 1}`,
          avatar: player.avatar || avatarChoices[index % avatarChoices.length]
        }))
      : defaultPlayers
});

export const createPlayer = (name: string, mode: GameMode, suffix = "", avatar?: string): PlayerState => ({
  name: suffix || name,
  avatar,
  score: 0,
  remainingScore: mode === "quick201" ? 201 : undefined,
  dartsThrown: 0,
  bullseyes: 0,
  bestThrow: 0,
  combo: 1,
  maxCombo: 1,
  accuracy: 0
});

export const updateAccuracy = (hits: number, dartsThrown: number) =>
  dartsThrown === 0 ? 0 : Math.round((hits / dartsThrown) * 100);
