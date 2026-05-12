import type { BonusTarget, DartThrow } from "../types/game";

export const DART_SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

export interface ScoreOptions {
  boardSize: number;
  bonusTarget?: BonusTarget;
  comboMultiplier: number;
  bullOffset: { x: number; y: number };
  goldenBull: boolean;
}

export const calculateThrow = (x: number, y: number, options: ScoreOptions): DartThrow => {
  const radius = options.boardSize / 2;
  const center = radius;
  const dx = x - center - options.bullOffset.x;
  const dy = y - center - options.bullOffset.y;
  const distance = Math.hypot(dx, dy);
  const normalized = distance / radius;

  let score = 0;
  let multiplier = 0;
  let segment: number | undefined;
  let zone: DartThrow["zone"] = "miss";

  if (normalized <= 0.052) {
    score = 50;
    multiplier = 1;
    zone = "innerBull";
  } else if (normalized <= 0.105) {
    score = 25;
    multiplier = 1;
    zone = "outerBull";
  } else if (normalized <= 0.92) {
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalizedAngle = (angle + 450 + 9) % 360;
    const index = Math.floor(normalizedAngle / 18) % 20;
    segment = DART_SEGMENTS[index];

    if (normalized >= 0.78 && normalized <= 0.92) {
      multiplier = 2;
      zone = "double";
    } else if (normalized >= 0.46 && normalized <= 0.56) {
      multiplier = 3;
      zone = "triple";
    } else {
      multiplier = 1;
      zone = "single";
    }
    score = segment * multiplier;
  }

  const isBonusHit =
    Boolean(options.bonusTarget && segment === options.bonusTarget.segment && options.bonusTarget.ring === zone) ||
    (options.goldenBull && zone === "innerBull");

  if (isBonusHit && zone !== "innerBull") {
    score *= 2;
  }

  if (options.goldenBull && zone === "innerBull") {
    score += 100;
  }

  score *= Math.max(1, options.comboMultiplier);

  return {
    x,
    y,
    score,
    zone,
    multiplier,
    segment,
    isBonusHit,
    isBullseye: zone === "innerBull"
  };
};
