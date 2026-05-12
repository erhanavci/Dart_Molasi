import { useEffect, useRef, useState } from "react";
import type { ActivePowerUp, BonusTarget, DartThrow } from "../types/game";
import { resolveDartLanding } from "./DartPhysics";
import { calculateThrow } from "./ScoreCalculator";

interface ArcadeDartGameProps {
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

interface Point {
  x: number;
  y: number;
}

interface StuckDart {
  id: string;
  x: number;
  y: number;
  angle: number;
  bonus: boolean;
}

interface HitEffect {
  id: string;
  x: number;
  y: number;
  src: string;
}

const BOARD_SIZE = 520;
const ASSET = "/assets/game-ui";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function ArcadeDartGame({
  bonusTarget,
  comboMultiplier,
  bullOffset,
  goldenBull,
  powerUps,
  disabled,
  throwSignal,
  onThrow,
  onPowerChange
}: ArcadeDartGameProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ aim: Point; pull: Point; power: number } | null>(null);
  const aimRef = useRef<Point>({ x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 });
  const throwSignalRef = useRef(throwSignal);
  const flyingRef = useRef(false);
  const [drag, setDrag] = useState<{ active: boolean; aim: Point; pull: Point; power: number }>({
    active: false,
    aim: { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 },
    pull: { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 },
    power: 0
  });
  const [dart, setDart] = useState({ x: BOARD_SIZE / 2, y: BOARD_SIZE * 0.82, angle: -18, flying: false });
  const [stuckDarts, setStuckDarts] = useState<StuckDart[]>([]);
  const [effects, setEffects] = useState<HitEffect[]>([]);

  const pointFromEvent = (event: React.PointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * BOARD_SIZE, 0, BOARD_SIZE),
      y: clamp(((event.clientY - rect.top) / rect.height) * BOARD_SIZE, 0, BOARD_SIZE)
    };
  };

  const angleTo = (from: Point, to: Point) => {
    const radians = Math.atan2(to.y - from.y, to.x - from.x);
    return (radians * 180) / Math.PI - 55;
  };

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || flyingRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const aim = pointFromEvent(event);
    const pull = { x: aim.x, y: Math.min(BOARD_SIZE - 18, aim.y + 72) };
    dragRef.current = { aim, pull, power: 0.2 };
    aimRef.current = aim;
    setDrag({ active: true, aim, pull, power: 0.2 });
    setDart({ x: pull.x, y: pull.y, angle: angleTo(pull, aim), flying: false });
    onPowerChange(0.2, true);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || flyingRef.current) return;
    const point = pointFromEvent(event);
    if (!dragRef.current) {
      const coffee = powerUps.some((powerUp) => powerUp.type === "coffeeBoost");
      const current = aimRef.current;
      aimRef.current = coffee
        ? { x: current.x + (point.x - current.x) * 0.28, y: current.y + (point.y - current.y) * 0.28 }
        : point;
      const idle = { x: aimRef.current.x, y: Math.min(BOARD_SIZE - 18, aimRef.current.y + 88) };
      setDart({ x: idle.x, y: idle.y, angle: angleTo(idle, aimRef.current), flying: false });
      return;
    }

    const aim = dragRef.current.aim;
    const dx = point.x - aim.x;
    const dy = point.y - aim.y;
    const pullDistance = clamp(Math.hypot(dx, dy), 28, 190);
    const direction = Math.atan2(dy, dx);
    const pull = {
      x: clamp(aim.x + Math.cos(direction) * pullDistance, 0, BOARD_SIZE),
      y: clamp(aim.y + Math.sin(direction) * pullDistance, 0, BOARD_SIZE)
    };
    const power = clamp(pullDistance / 190, 0.15, 1);
    dragRef.current = { aim, pull, power };
    setDrag({ active: true, aim, pull, power });
    setDart({ x: pull.x, y: pull.y, angle: angleTo(pull, aim), flying: false });
    onPowerChange(power, true);
  };

  const completeThrow = (power: number, visualStart?: Point) => {
    if (disabled || flyingRef.current) return;
    flyingRef.current = true;
    const landing = resolveDartLanding(aimRef.current.x, aimRef.current.y, power, BOARD_SIZE, powerUps);
    const throwResult = calculateThrow(landing.x, landing.y, {
      boardSize: BOARD_SIZE,
      bonusTarget,
      comboMultiplier,
      bullOffset,
      goldenBull
    });
    const start = visualStart ?? { x: dart.x, y: dart.y };
    const target = { x: throwResult.x, y: throwResult.y };
    const angle = angleTo(start, target);
    onPowerChange(power, false);
    setDart({ x: target.x, y: target.y, angle, flying: true });

    window.setTimeout(() => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setStuckDarts((current) => [
        ...current.slice(-8),
        { id, x: throwResult.x, y: throwResult.y, angle, bonus: throwResult.isBonusHit || throwResult.isBullseye }
      ]);
      const effectSrc = throwResult.isBullseye
        ? "bullseye-pop"
        : throwResult.isBonusHit
          ? "bonus-target"
          : throwResult.score >= 50
            ? "fx-gold"
            : "fx-blue";
      setEffects((current) => [...current.slice(-3), { id, x: throwResult.x, y: throwResult.y, src: effectSrc }]);
      window.setTimeout(() => setEffects((current) => current.filter((effect) => effect.id !== id)), 700);
      setDart({ x: aimRef.current.x, y: Math.min(BOARD_SIZE - 18, aimRef.current.y + 88), angle: -18, flying: false });
      flyingRef.current = false;
      onThrow(throwResult);
    }, 250);
  };

  const release = () => {
    if (!dragRef.current || disabled || flyingRef.current) return;
    const dragState = dragRef.current;
    dragRef.current = null;
    setDrag((current) => ({ ...current, active: false }));
    completeThrow(dragState.power, dragState.pull);
  };

  useEffect(() => {
    if (throwSignalRef.current === throwSignal) return;
    throwSignalRef.current = throwSignal;
    if (disabled || flyingRef.current) return;
    completeThrow(powerUps.some((powerUp) => powerUp.type === "focusMode") ? 0.78 : 0.68);
  }, [bonusTarget, comboMultiplier, disabled, goldenBull, powerUps, throwSignal]);

  const bullStyle = {
    left: `${50 + (bullOffset.x / BOARD_SIZE) * 100}%`,
    top: `${50 + (bullOffset.y / BOARD_SIZE) * 100}%`
  };

  return (
    <div
      ref={boardRef}
      className="relative mx-auto aspect-square w-full max-w-[min(78vh,620px)] touch-none select-none overflow-hidden rounded-[28px] border border-cyan-200/20 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,.14),transparent_36%),linear-gradient(145deg,rgba(8,13,24,.96),rgba(17,24,39,.98))] p-3 shadow-[0_0_42px_rgba(56,189,248,.24)]"
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={release}
      onPointerCancel={release}
      role="application"
      aria-label="Dart Molası oyun alanı"
    >
      <div className="absolute inset-3 rounded-[24px] bg-[linear-gradient(135deg,rgba(255,255,255,.06),transparent_34%),radial-gradient(circle_at_50%_50%,rgba(14,165,233,.12),transparent_60%)]" />
      <img className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain drop-shadow-[0_22px_34px_rgba(0,0,0,.55)]" src={`${ASSET}/board.png`} alt="" draggable={false} />

      {(goldenBull || Math.abs(bullOffset.x) + Math.abs(bullOffset.y) > 1) && (
        <img
          className="pointer-events-none absolute z-20 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-90 mix-blend-screen"
          src={`${ASSET}/${goldenBull ? "golden-bull" : "moving-bull"}.png`}
          alt=""
          style={bullStyle}
          draggable={false}
        />
      )}

      {drag.active && (
        <>
          <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full">
            <line
              x1={`${(drag.aim.x / BOARD_SIZE) * 100}%`}
              y1={`${(drag.aim.y / BOARD_SIZE) * 100}%`}
              x2={`${(drag.pull.x / BOARD_SIZE) * 100}%`}
              y2={`${(drag.pull.y / BOARD_SIZE) * 100}%`}
              stroke="rgba(251,191,36,.95)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="12 10"
            />
          </svg>
          <div
            className="pointer-events-none absolute z-40 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-100 bg-cyan-300/20 shadow-[0_0_24px_rgba(103,232,249,.8)]"
            style={{ left: `${(drag.aim.x / BOARD_SIZE) * 100}%`, top: `${(drag.aim.y / BOARD_SIZE) * 100}%` }}
          />
        </>
      )}

      {stuckDarts.map((item) => (
        <img
          key={item.id}
          className={`pointer-events-none absolute z-40 h-[24%] -translate-x-1/2 -translate-y-[88%] object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,.55)] ${
            item.bonus ? "brightness-125 saturate-150" : ""
          }`}
          src={`${ASSET}/dart-red.png`}
          alt=""
          style={{ left: `${(item.x / BOARD_SIZE) * 100}%`, top: `${(item.y / BOARD_SIZE) * 100}%`, transform: `translate(-50%, -88%) rotate(${item.angle}deg)` }}
          draggable={false}
        />
      ))}

      {effects.map((effect) => (
        <img
          key={effect.id}
          className="pointer-events-none absolute z-50 h-[28%] -translate-x-1/2 -translate-y-1/2 animate-score-pop object-contain mix-blend-screen"
          src={`${ASSET}/${effect.src}.png`}
          alt=""
          style={{ left: `${(effect.x / BOARD_SIZE) * 100}%`, top: `${(effect.y / BOARD_SIZE) * 100}%` }}
          draggable={false}
        />
      ))}

      <img
        className={`pointer-events-none absolute z-[60] h-[32%] -translate-x-1/2 -translate-y-[86%] object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,.6)] ${
          dart.flying ? "transition-all duration-[250ms] ease-out" : "transition-transform duration-75"
        }`}
        src={`${ASSET}/dart-red.png`}
        alt=""
        style={{ left: `${(dart.x / BOARD_SIZE) * 100}%`, top: `${(dart.y / BOARD_SIZE) * 100}%`, transform: `translate(-50%, -86%) rotate(${dart.angle}deg)` }}
        draggable={false}
      />

      <div className="pointer-events-none absolute left-5 right-5 top-5 z-[70] rounded-2xl border border-cyan-300/30 bg-slate-950/70 p-3 shadow-[0_0_26px_rgba(56,189,248,.22)]">
        <div className="mb-2 flex items-center justify-between text-xs font-black uppercase text-cyan-100">
          <span>{drag.active ? "Geri çek ve bırak" : "Hedefe bas"}</span>
          <span>{Math.round(drag.power * 100)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-900">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400 shadow-[0_0_18px_rgba(251,191,36,.6)]" style={{ width: `${Math.round(drag.power * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
