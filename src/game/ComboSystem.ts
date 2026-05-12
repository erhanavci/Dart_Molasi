export interface ComboResult {
  streak: number;
  multiplier: number;
  maxMultiplier: number;
  message?: string;
}

export const nextCombo = (previousStreak: number, previousMax: number, score: number, isBullseye: boolean): ComboResult => {
  if (score < 20) {
    return {
      streak: 0,
      multiplier: 1,
      maxMultiplier: previousMax,
      message: previousStreak > 0 ? "Kombo bozuldu!" : undefined
    };
  }

  const streak = isBullseye ? Math.max(previousStreak + 1, 3) : previousStreak + 1;
  const multiplier = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
  const maxMultiplier = Math.max(previousMax, multiplier);
  const message =
    multiplier === 3 ? "Kombo x3" : multiplier === 2 && previousStreak < 3 ? "Kombo Başladı!" : "Seri devam ediyor!";

  return { streak, multiplier, maxMultiplier, message };
};
