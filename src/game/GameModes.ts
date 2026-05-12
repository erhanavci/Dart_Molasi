import type { GameMode } from "../types/game";

export interface GameModeConfig {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
  seconds?: number;
  rounds?: number;
  dartsPerTurn: number;
  movingBull: boolean;
  combo: boolean;
  powerUps: boolean;
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  quick201: {
    id: "quick201",
    title: "Hızlı 201",
    subtitle: "201'den sıfıra in!",
    description: "3 dart, temiz hedef, hızlı zafer.",
    dartsPerTurn: 3,
    movingBull: false,
    combo: false,
    powerUps: false
  },
  bullRush: {
    id: "bullRush",
    title: "Bull Rush",
    subtitle: "90 saniyede en yüksek skoru yap!",
    description: "Hareketli Bull'u yakala.",
    seconds: 90,
    dartsPerTurn: 3,
    movingBull: true,
    combo: true,
    powerUps: true
  },
  officeDuel: {
    id: "officeDuel",
    title: "Ofis Düellosu",
    subtitle: "Yan masadaki rakibini yen!",
    description: "Aynı ekranda arkadaşına meydan oku.",
    rounds: 5,
    dartsPerTurn: 3,
    movingBull: false,
    combo: false,
    powerUps: false
  },
  bossComing: {
    id: "bossComing",
    title: "Patron Geliyor",
    subtitle: "Alarm dolmadan en yüksek skoru yap!",
    description: "Patron yaklaşıyor!",
    seconds: 90,
    dartsPerTurn: 3,
    movingBull: true,
    combo: true,
    powerUps: true
  }
};

export const modeOrder: GameMode[] = ["quick201", "bullRush", "officeDuel", "bossComing"];
