import type { ActivePowerUp } from "../types/game";
import { clamp, randomBetween } from "../utils/random";

export const resolveDartLanding = (
  aimX: number,
  aimY: number,
  power: number,
  boardSize: number,
  powerUps: ActivePowerUp[]
) => {
  const focus = powerUps.some((powerUp) => powerUp.type === "focusMode");
  const lucky = powerUps.some((powerUp) => powerUp.type === "luckyPostIt");
  const stablePower = clamp(power, 0, 1);
  const spread = (focus ? 7 : 13) + (1 - stablePower) * (focus ? 18 : 34);
  let x = aimX + randomBetween(-spread, spread);
  let y = aimY + randomBetween(-spread, spread) + (1 - stablePower) * 28;

  if (lucky) {
    const center = boardSize / 2;
    const dx = center - x;
    const dy = center - y;
    const distance = Math.hypot(dx, dy);
    if (distance > boardSize * 0.38 && distance < boardSize * 0.55) {
      x += dx * 0.16;
      y += dy * 0.16;
    }
  }

  return {
    x: clamp(x, 0, boardSize),
    y: clamp(y, 0, boardSize)
  };
};
