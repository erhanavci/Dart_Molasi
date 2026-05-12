import type { GameMode, PlayerState, SettingsState } from "../types/game";

export const defaultSettings: SettingsState = {
  playerName: "Oyuncu",
  defaultMode: "bullRush",
  sound: true,
  effects: true,
  language: "Türkçe"
};

export const createPlayer = (name: string, mode: GameMode, suffix = ""): PlayerState => ({
  name: suffix || name,
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
