import { useCallback, useEffect, useMemo, useState } from "react";
import { bonusLabel, createBonusTarget, shouldRefreshBonus } from "../game/BonusSystem";
import { nextCombo } from "../game/ComboSystem";
import { resultTitles } from "../game/Effects";
import { createPlayer, defaultPlayers, updateAccuracy } from "../game/GameState";
import { GAME_MODES } from "../game/GameModes";
import { maybeCreatePowerUp, prunePowerUps } from "../game/PowerUps";
import type { ActivePowerUp, BonusTarget, DartThrow, GameMode, GameResult, LeaderboardEntry, PlayerProfile, PlayerState } from "../types/game";
import { randomItem, uid } from "../utils/random";

export type GamePhase = "playing" | "betweenTurns" | "finished";

export interface GameEvent {
  id: string;
  text: string;
  tone: "score" | "bonus" | "combo" | "warning";
}

interface UseGameStateArgs {
  mode: GameMode;
  playerName: string;
  playerProfiles?: PlayerProfile[];
  onSaveScore: (entry: LeaderboardEntry) => void;
}

export function useGameState({ mode, playerName, playerProfiles, onSaveScore }: UseGameStateArgs) {
  const config = GAME_MODES[mode];
  const profiles = playerProfiles && playerProfiles.length > 0 ? playerProfiles : defaultPlayers;
  const [players, setPlayers] = useState<PlayerState[]>(() =>
    mode === "officeDuel"
      ? [
          createPlayer(profiles[0]?.name ?? "Oyuncu 1", mode, profiles[0]?.name ?? "Oyuncu 1", profiles[0]?.avatar),
          createPlayer(profiles[1]?.name ?? "Oyuncu 2", mode, profiles[1]?.name ?? "Oyuncu 2", profiles[1]?.avatar)
        ]
      : [createPlayer(playerName, mode, profiles[0]?.name ?? playerName, profiles[0]?.avatar)]
  );
  const [activePlayer, setActivePlayer] = useState(0);
  const [turnDarts, setTurnDarts] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [timeLeft, setTimeLeft] = useState(config.seconds ?? 0);
  const [bossAlarm, setBossAlarm] = useState(0);
  const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
  const [bonusTarget, setBonusTarget] = useState<BonusTarget | undefined>(() => (config.powerUps ? createBonusTarget() : undefined));
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [startedAt] = useState(Date.now());
  const [lastThrow, setLastThrow] = useState<DartThrow | undefined>();
  const [motionTick, setMotionTick] = useState(0);
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [suddenDistances, setSuddenDistances] = useState<[number | undefined, number | undefined]>([undefined, undefined]);

  const addEvent = useCallback((text: string, tone: GameEvent["tone"] = "score") => {
    const id = uid();
    setEvents((current) => [...current.slice(-3), { id, text, tone }]);
    window.setTimeout(() => setEvents((current) => current.filter((event) => event.id !== id)), 1500);
  }, []);

  const bullOffset = useMemo(() => {
    if (!config.movingBull) return { x: 0, y: 0 };
    const t = Date.now() / 1000;
    return { x: Math.sin(t * 1.2) * 12, y: Math.cos(t * 0.9) * 10 };
  }, [config.movingBull, motionTick]);

  const goldenBull = config.movingBull && Math.floor(Date.now() / 6000) % 3 === 0;

  useEffect(() => {
    if (!config.movingBull || phase !== "playing") return;
    const timer = window.setInterval(() => setMotionTick((value) => value + 1), 100);
    return () => window.clearInterval(timer);
  }, [config.movingBull, phase]);

  const finishGame = useCallback(
    (forcedPlayers = players) => {
      if (phase === "finished") return;
      setPhase("finished");
      const winner = [...forcedPlayers].sort((a, b) => b.score - a.score)[0];
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      onSaveScore({
        id: uid(),
        playerName: winner.name,
        mode,
        score: mode === "quick201" ? 201 - (winner.remainingScore ?? 0) : winner.score,
        date: new Date().toISOString(),
        maxCombo: winner.maxCombo,
        bullseyes: winner.bullseyes,
        accuracy: winner.accuracy
      });
    },
    [mode, onSaveScore, phase, players, startedAt]
  );

  useEffect(() => {
    if (!config.seconds || phase !== "playing") return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          addEvent(mode === "bossComing" ? "Yakalanmadan mola tamamlandı!" : "Süre doldu!", "warning");
          finishGame();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [addEvent, config.seconds, finishGame, mode, phase]);

  useEffect(() => {
    if (mode !== "bossComing" || phase !== "playing") return;
    const timer = window.setInterval(() => {
      setBossAlarm((value) => {
        const next = Math.min(100, value + 1.1);
        if (next >= 100) {
          addEvent("Patron seni yakaladı!", "warning");
          finishGame();
        }
        return next;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [addEvent, finishGame, mode, phase]);

  useEffect(() => {
    if (!config.powerUps || phase !== "playing") return;
    const timer = window.setInterval(() => {
      setPowerUps((current) => prunePowerUps(current));
      setBonusTarget((current) => (shouldRefreshBonus(current) ? createBonusTarget() : current));
    }, 600);
    return () => window.clearInterval(timer);
  }, [config.powerUps, phase]);

  const handleThrow = useCallback(
    (throwResult: DartThrow) => {
      if (phase !== "playing") return;
      setLastThrow(throwResult);
      const suddenDistance = Math.hypot(throwResult.x - 260, throwResult.y - 260);
      let extraDart = false;
      const newPowerUp = config.powerUps ? maybeCreatePowerUp() : undefined;
      if (newPowerUp) {
        addEvent(newPowerUp.label, "bonus");
        extraDart = newPowerUp.type === "meetingCancelled";
        if (!extraDart) setPowerUps((current) => [...prunePowerUps(current), newPowerUp]);
      }

      setPlayers((currentPlayers) => {
        const nextPlayers = [...currentPlayers];
        const player = { ...nextPlayers[activePlayer] };
        const baseScore = throwResult.score;
        const comboResult = config.combo ? nextCombo(player.combo === 1 ? 0 : player.combo, player.maxCombo, baseScore, throwResult.isBullseye) : undefined;
        const score = baseScore;
        player.dartsThrown += 1;
        player.bestThrow = Math.max(player.bestThrow, score);
        player.bullseyes += throwResult.isBullseye ? 1 : 0;
        player.accuracy = updateAccuracy(player.dartsThrown - (score === 0 ? 1 : 0), player.dartsThrown);
        player.combo = comboResult?.multiplier ?? 1;
        player.maxCombo = Math.max(player.maxCombo, comboResult?.maxMultiplier ?? 1);

        let completedQuick201 = false;
        if (mode === "quick201") {
          const remaining = (player.remainingScore ?? 201) - score;
          if (remaining < 0) {
            addEvent("Puanı aştın! Tur iptal edildi.", "warning");
            player.remainingScore = player.remainingScore;
          } else {
            player.remainingScore = remaining;
            player.score = 201 - remaining;
            if (remaining === 0) {
              addEvent("Tebrikler! 201'i bitirdin.", "bonus");
              completedQuick201 = true;
            }
          }
        } else {
          player.score += score;
        }

        if (mode === "bossComing") {
          setBossAlarm((alarm) => Math.max(0, Math.min(100, alarm + (score < 10 ? 8 : score >= 40 ? -5 : 1))));
          if (score < 10) addEvent(randomItem(["Toplantı başlıyor!", "Kahve molası bitiyor!", "Excel dosyasına dönmen gerek!"]), "warning");
        }

        if (throwResult.isBonusHit) addEvent(throwResult.isBullseye ? "Altın Bull!" : "Bonus İsabet!", "bonus");
        if (comboResult?.message) addEvent(comboResult.message, "combo");
        addEvent(`+${score}`, score >= 50 ? "bonus" : "score");
        nextPlayers[activePlayer] = player;
        if (completedQuick201) window.setTimeout(() => finishGame(nextPlayers), 250);
        if (mode === "officeDuel" && suddenDeath) {
          if (activePlayer === 0) {
            setSuddenDistances([suddenDistance, undefined]);
          } else {
            const firstDistance = suddenDistances[0] ?? Number.POSITIVE_INFINITY;
            const winnerIndex = suddenDistance < firstDistance ? 1 : 0;
            nextPlayers[winnerIndex] = { ...nextPlayers[winnerIndex], score: nextPlayers[winnerIndex].score + 1 };
            addEvent(winnerIndex === 0 ? "Kazanan: Oyuncu 1" : "Kazanan: Oyuncu 2", "bonus");
            window.setTimeout(() => finishGame(nextPlayers), 300);
          }
        }
        return nextPlayers;
      });

      setTurnDarts((value) => {
        const next = value + (extraDart ? 0 : 1);
        if (next >= (suddenDeath ? 1 : config.dartsPerTurn)) {
          setPhase("betweenTurns");
        }
        return next;
      });
    },
    [activePlayer, addEvent, config.combo, config.dartsPerTurn, config.powerUps, finishGame, mode, phase, suddenDeath, suddenDistances]
  );

  const nextTurn = useCallback(() => {
    if (mode === "officeDuel") {
      if (suddenDeath) {
        if (activePlayer === 0) {
          setActivePlayer(1);
          setTurnDarts(0);
          setPhase("playing");
          addEvent("Oyuncu 2 sıra sende!", "combo");
          return;
        }
        finishGame();
        return;
      }
      const nextPlayer = activePlayer === 0 ? 1 : 0;
      setActivePlayer(nextPlayer);
      if (activePlayer === 1) setRound((value) => value + 1);
      if (activePlayer === 1 && round >= (config.rounds ?? 5)) {
        if (players[0]?.score === players[1]?.score) {
          setSuddenDeath(true);
          setSuddenDistances([undefined, undefined]);
          setActivePlayer(0);
          setTurnDarts(0);
          setPhase("playing");
          addEvent("Ani Ölüm!", "warning");
          return;
        }
        finishGame();
        return;
      }
      addEvent(nextPlayer === 0 ? "Oyuncu 1 sıra sende!" : "Oyuncu 2 sıra sende!", "combo");
    }
    setTurnDarts(0);
    setPhase("playing");
  }, [activePlayer, addEvent, config.rounds, finishGame, mode, players, round, suddenDeath]);

  const result: GameResult | undefined = useMemo(() => {
    if (phase !== "finished") return undefined;
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    return {
      title: mode === "bossComing" ? "Patron Görmeden Bitti!" : randomItem(resultTitles),
      mode,
      playerName: winner.name,
      totalScore: mode === "quick201" ? 201 - (winner.remainingScore ?? 0) : winner.score,
      bestThrow: winner.bestThrow,
      bullseyes: winner.bullseyes,
      maxCombo: winner.maxCombo,
      accuracy: winner.accuracy,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000)
    };
  }, [mode, phase, players, startedAt]);

  return {
    config,
    players,
    activePlayer,
    turnDarts,
    round,
    suddenDeath,
    phase,
    timeLeft,
    bossAlarm,
    powerUps,
    bonusTarget,
    bonusText: bonusLabel(bonusTarget),
    bullOffset,
    goldenBull,
    events,
    lastThrow,
    result,
    handleThrow,
    nextTurn,
    finishGame
  };
}
