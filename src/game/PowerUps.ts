import type { ActivePowerUp, PowerUpType } from "../types/game";
import { randomItem } from "../utils/random";

const labels: Record<PowerUpType, string> = {
  coffeeBoost: "Kahve Desteği Aktif!",
  focusMode: "Odak Modu!",
  meetingCancelled: "Toplantı İptal! +1 Dart",
  luckyPostIt: "Şanslı Post-it!"
};

const timed: PowerUpType[] = ["coffeeBoost", "focusMode", "luckyPostIt"];
const all: PowerUpType[] = ["coffeeBoost", "focusMode", "meetingCancelled", "luckyPostIt"];

export const maybeCreatePowerUp = (): ActivePowerUp | undefined => {
  if (Math.random() > 0.11) return undefined;
  const type = randomItem(all);
  return {
    type,
    label: labels[type],
    expiresAt: timed.includes(type) ? Date.now() + 3000 : undefined
  };
};

export const prunePowerUps = (powerUps: ActivePowerUp[]) =>
  powerUps.filter((powerUp) => !powerUp.expiresAt || Date.now() < powerUp.expiresAt);
