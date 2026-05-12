import { GAME_MODES } from "../game/GameModes";
import type { GameMode } from "../types/game";

export const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const modeName = (mode: GameMode) => GAME_MODES[mode].title;

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
