import type { BonusTarget } from "../types/game";
import { randomItem } from "../utils/random";
import { DART_SEGMENTS } from "./ScoreCalculator";

export const createBonusTarget = (): BonusTarget => ({
  ring: randomItem(["double", "triple"]),
  segment: randomItem(DART_SEGMENTS),
  expiresAt: Date.now() + Math.round(3000 + Math.random() * 2000)
});

export const bonusLabel = (bonus?: BonusTarget) => {
  if (!bonus) return "Bonus Hedef!";
  return bonus.ring === "triple" ? "Parlayan Triple!" : "Parlayan Double!";
};

export const shouldRefreshBonus = (bonus?: BonusTarget) => !bonus || Date.now() > bonus.expiresAt;
