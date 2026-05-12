import { Application } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import type { ActivePowerUp, BonusTarget, DartThrow } from "../types/game";
import { resolveDartLanding } from "./DartPhysics";
import { calculateThrow } from "./ScoreCalculator";
import { DartBoard } from "./DartBoard";

interface PixiGameProps {
  bonusTarget?: BonusTarget;
  comboMultiplier: number;
  bullOffset: { x: number; y: number };
  goldenBull: boolean;
  powerUps: ActivePowerUp[];
  disabled?: boolean;
  throwSignal: number;
  onThrow: (throwResult: DartThrow) => void;
  onPowerChange: (power: number, charging: boolean) => void;
}

const BOARD_SIZE = 520;

export default function PixiGame({
  bonusTarget,
  comboMultiplier,
  bullOffset,
  goldenBull,
  powerUps,
  disabled,
  throwSignal,
  onThrow,
  onPowerChange
}: PixiGameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const boardRef = useRef<DartBoard | null>(null);
  const aimRef = useRef({ x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 });
  const chargeRef = useRef<{ start: number; direction: 1 | -1 } | null>(null);
  const throwSignalRef = useRef(throwSignal);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;
    const app = new Application();

    app
      .init({
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true
      })
      .then(() => {
        if (destroyed || !hostRef.current) {
          app.destroy(true);
          return;
        }

        appRef.current = app;
        hostRef.current.appendChild(app.canvas);
        const board = new DartBoard(BOARD_SIZE);
        boardRef.current = board;
        board.draw(bonusTarget, bullOffset, goldenBull);
        board.setAim(aimRef.current.x, aimRef.current.y);
        app.stage.addChild(board.container);
        app.ticker.add(() => {
          if (!chargeRef.current) return;
          const elapsed = (performance.now() - chargeRef.current.start) / 850;
          const wave = Math.abs(((elapsed % 2) + 2) % 2 - 1);
          onPowerChange(wave, true);
        });
        setReady(true);
      });

    return () => {
      destroyed = true;
      setReady(false);
      boardRef.current = null;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    boardRef.current?.draw(bonusTarget, bullOffset, goldenBull);
    boardRef.current?.setAim(
      aimRef.current.x,
      aimRef.current.y,
      powerUps.some((powerUp) => powerUp.type === "coffeeBoost")
    );
  }, [bonusTarget, bullOffset, goldenBull, powerUps]);

  const pointerToBoard = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = BOARD_SIZE / rect.width;
    const scaleY = BOARD_SIZE / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const moveAim = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const point = pointerToBoard(event);
    const coffee = powerUps.some((powerUp) => powerUp.type === "coffeeBoost");
    const current = aimRef.current;
    aimRef.current = coffee
      ? { x: current.x + (point.x - current.x) * 0.36, y: current.y + (point.y - current.y) * 0.36 }
      : point;
    boardRef.current?.setAim(aimRef.current.x, aimRef.current.y, coffee);
  };

  const beginCharge = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !ready) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveAim(event);
    chargeRef.current = { start: performance.now(), direction: 1 };
    onPowerChange(0, true);
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !chargeRef.current) return;
    const elapsed = (performance.now() - chargeRef.current.start) / 850;
    const power = Math.abs(((elapsed % 2) + 2) % 2 - 1);
    chargeRef.current = null;
    onPowerChange(power, false);

    const landing = resolveDartLanding(aimRef.current.x, aimRef.current.y, power, BOARD_SIZE, powerUps);
    const throwResult = calculateThrow(landing.x, landing.y, {
      boardSize: BOARD_SIZE,
      bonusTarget,
      comboMultiplier,
      bullOffset,
      goldenBull
    });
    boardRef.current?.addThrowMark(throwResult);
    onThrow(throwResult);
  };

  useEffect(() => {
    if (throwSignalRef.current === throwSignal) return;
    throwSignalRef.current = throwSignal;
    if (disabled || !ready) return;
    const powerValue = powerUps.some((powerUp) => powerUp.type === "focusMode") ? 0.74 : 0.7;
    onPowerChange(powerValue, false);
    const landing = resolveDartLanding(aimRef.current.x, aimRef.current.y, powerValue, BOARD_SIZE, powerUps);
    const throwResult = calculateThrow(landing.x, landing.y, {
      boardSize: BOARD_SIZE,
      bonusTarget,
      comboMultiplier,
      bullOffset,
      goldenBull
    });
    boardRef.current?.addThrowMark(throwResult);
    onThrow(throwResult);
  }, [bonusTarget, bullOffset, comboMultiplier, disabled, goldenBull, onPowerChange, onThrow, powerUps, ready, throwSignal]);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[min(78vh,580px)] touch-none select-none rounded-[28px] border border-white/10 bg-slate-950/20 p-2 shadow-neon"
      onPointerDown={beginCharge}
      onPointerMove={moveAim}
      onPointerUp={release}
      onPointerCancel={release}
      role="application"
      aria-label="Dart tahtası"
    >
      <div ref={hostRef} className="h-full w-full [&>canvas]:h-full [&>canvas]:w-full" />
      <div className="pointer-events-none absolute inset-x-6 bottom-5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-pink-400" />
      </div>
    </div>
  );
}
