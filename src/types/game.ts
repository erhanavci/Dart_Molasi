export type GameMode = "quick201" | "bullRush" | "officeDuel" | "bossComing";

export type PowerUpType = "coffeeBoost" | "focusMode" | "meetingCancelled" | "luckyPostIt";

export type HitZone = "single" | "double" | "triple" | "outerBull" | "innerBull" | "miss";

export interface DartThrow {
  x: number;
  y: number;
  score: number;
  zone: HitZone;
  multiplier: number;
  segment?: number;
  isBonusHit: boolean;
  isBullseye: boolean;
}

export interface PlayerState {
  name: string;
  score: number;
  remainingScore?: number;
  dartsThrown: number;
  bullseyes: number;
  bestThrow: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  mode: GameMode;
  score: number;
  date: string;
  maxCombo: number;
  bullseyes: number;
  accuracy: number;
}

export interface SettingsState {
  playerName: string;
  defaultMode: GameMode;
  sound: boolean;
  effects: boolean;
  language: "Türkçe";
}

export interface BonusTarget {
  ring: "double" | "triple";
  segment: number;
  expiresAt: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  label: string;
  expiresAt?: number;
}

export interface ThrowInput {
  aimX: number;
  aimY: number;
  power: number;
  boardSize: number;
  comboMultiplier: number;
  bonusTarget?: BonusTarget;
  bullOffset: { x: number; y: number };
  goldenBull: boolean;
  powerUps: ActivePowerUp[];
}

export interface GameResult {
  title: string;
  mode: GameMode;
  playerName: string;
  totalScore: number;
  bestThrow: number;
  bullseyes: number;
  maxCombo: number;
  accuracy: number;
  durationSeconds: number;
}
