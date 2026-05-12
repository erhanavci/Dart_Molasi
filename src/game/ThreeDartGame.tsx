import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { ActivePowerUp, BonusTarget, DartThrow } from "../types/game";
import { resolveDartLanding } from "./DartPhysics";
import { calculateThrow, DART_SEGMENTS } from "./ScoreCalculator";

interface ThreeDartGameProps {
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
const WORLD_RADIUS = 2.6;
const RING_DEPTH = 0.12;
const segmentColors = {
  dark: 0x161d2f,
  cream: 0xf3ead0,
  red: 0xe63b57,
  green: 0x20b469,
  amber: 0xfbbf24,
  pink: 0xf472b6,
  wire: 0xdfe8ff
};

export default function ThreeDartGame({
  bonusTarget,
  comboMultiplier,
  bullOffset,
  goldenBull,
  powerUps,
  disabled,
  throwSignal,
  onThrow,
  onPowerChange
}: ThreeDartGameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    board: THREE.Group;
    dart: THREE.Group;
    marks: THREE.Group;
    trail: THREE.Line;
    raf: number;
  } | null>(null);
  const aimRef = useRef({ x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 });
  const dragRef = useRef<{ start: { x: number; y: number }; current: { x: number; y: number }; power: number } | null>(null);
  const throwSignalRef = useRef(throwSignal);
  const [dragPower, setDragPower] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hostRef.current) return;
    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x101523, 7, 12);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(0, -0.22, 8.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientWidth);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x9fb8ff, 1.8);
    const key = new THREE.SpotLight(0xffffff, 16, 18, Math.PI / 5, 0.45, 1.2);
    key.position.set(-2.5, -4, 7);
    key.castShadow = true;
    const rim = new THREE.PointLight(0x34d399, 4, 10);
    rim.position.set(3.4, 2.8, 3.2);
    scene.add(ambient, key, rim);

    const board = new THREE.Group();
    const marks = new THREE.Group();
    const dart = createDartMesh();
    const trail = createTrail();
    scene.add(board, marks, trail, dart);

    sceneRef.current = { renderer, scene, camera, board, dart, marks, trail, raf: 0 };
    rebuildBoard(board, bonusTarget, bullOffset, goldenBull);
    setDartPosition(dart, trail, aimRef.current.x, aimRef.current.y, 1.35);
    setReady(true);

    const resize = () => {
      const size = Math.max(320, host.clientWidth);
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    const animate = () => {
      const current = sceneRef.current;
      if (!current) return;
      current.renderer.render(current.scene, current.camera);
      current.raf = requestAnimationFrame(animate);
    };
    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      const current = sceneRef.current;
      if (!current) return;
      cancelAnimationFrame(current.raf);
      host.removeChild(current.renderer.domElement);
      current.renderer.dispose();
      disposeObject(current.scene);
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    rebuildBoard(sceneRef.current.board, bonusTarget, bullOffset, goldenBull);
    setDartPosition(sceneRef.current.dart, sceneRef.current.trail, aimRef.current.x, aimRef.current.y, 1.35);
  }, [bonusTarget, bullOffset, goldenBull]);

  const pointFromEvent = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * BOARD_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * BOARD_SIZE
    };
  };

  const moveDart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !sceneRef.current) return;
    const point = pointFromEvent(event);
    if (dragRef.current) {
      const drag = dragRef.current;
      drag.current = point;
      const power = Math.min(1, Math.hypot(point.x - drag.start.x, point.y - drag.start.y) / 180);
      drag.power = power;
      setDragPower(power);
      onPowerChange(power, true);
      setPulledDartPosition(sceneRef.current.dart, sceneRef.current.trail, drag.start, point, power);
      return;
    }
    const coffee = powerUps.some((powerUp) => powerUp.type === "coffeeBoost");
    const current = aimRef.current;
    aimRef.current = coffee
      ? { x: current.x + (point.x - current.x) * 0.34, y: current.y + (point.y - current.y) * 0.34 }
      : point;
    setDartPosition(sceneRef.current.dart, sceneRef.current.trail, aimRef.current.x, aimRef.current.y, 1.35);
  };

  const beginCharge = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !ready) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    aimRef.current = point;
    dragRef.current = { start: point, current: point, power: 0 };
    if (sceneRef.current) setPulledDartPosition(sceneRef.current.dart, sceneRef.current.trail, point, point, 0);
    setDragPower(0);
    onPowerChange(0, true);
  };

  const finishThrow = (powerValue: number) => {
    if (!sceneRef.current) return;
    onPowerChange(powerValue, false);
    const landing = resolveDartLanding(aimRef.current.x, aimRef.current.y, powerValue, BOARD_SIZE, powerUps);
    const throwResult = calculateThrow(landing.x, landing.y, {
      boardSize: BOARD_SIZE,
      bonusTarget,
      comboMultiplier,
      bullOffset,
      goldenBull
    });
    addHitMark(sceneRef.current.marks, throwResult);
    addStuckDart(sceneRef.current.marks, throwResult);
    animateDartHit(sceneRef.current.dart, sceneRef.current.trail, throwResult.x, throwResult.y, aimRef.current.x, aimRef.current.y);
    onThrow(throwResult);
  };

  const release = () => {
    if (disabled || !dragRef.current) return;
    const power = Math.max(0.08, dragRef.current.power);
    dragRef.current = null;
    setDragPower(0);
    finishThrow(power);
  };

  useEffect(() => {
    if (throwSignalRef.current === throwSignal) return;
    throwSignalRef.current = throwSignal;
    if (disabled || !ready) return;
    setDragPower(0);
    finishThrow(powerUps.some((powerUp) => powerUp.type === "focusMode") ? 0.74 : 0.7);
  }, [bonusTarget, bullOffset, comboMultiplier, disabled, goldenBull, powerUps, ready, throwSignal]);

  return (
    <div
      ref={hostRef}
      className="relative mx-auto aspect-square w-full max-w-[min(78vh,620px)] touch-none select-none overflow-hidden rounded-[28px] border border-emerald-200/15 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.12),transparent_34%),linear-gradient(145deg,rgba(15,23,42,.74),rgba(10,13,23,.94))] shadow-neon"
      onPointerDown={beginCharge}
      onPointerMove={moveDart}
      onPointerUp={release}
      onPointerCancel={release}
      role="application"
      aria-label="3D dart sahnesi"
    >
      <div className={`pointer-events-none absolute left-5 right-5 top-5 rounded-2xl border border-cyan-300/30 bg-slate-950/60 p-3 shadow-[0_0_26px_rgba(56,189,248,.22)] transition-opacity ${dragPower > 0 ? "opacity-100" : "opacity-70"}`}>
        <div className="mb-2 flex items-center justify-between text-xs font-black uppercase text-cyan-100">
          <span>Geri çekme gücü</span>
          <span>{Math.round(dragPower * 100)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400 shadow-[0_0_18px_rgba(251,191,36,.6)]"
            style={{ width: `${Math.round(dragPower * 100)}%` }}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-5 bottom-5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-pink-400" />
      </div>
    </div>
  );
}

function boardToWorld(x: number, y: number) {
  return {
    x: (x / BOARD_SIZE - 0.5) * WORLD_RADIUS * 2,
    y: -(y / BOARD_SIZE - 0.5) * WORLD_RADIUS * 2
  };
}

function rebuildBoard(group: THREE.Group, bonus?: BonusTarget, bullOffset = { x: 0, y: 0 }, goldenBull = false) {
  group.clear();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(WORLD_RADIUS * 1.05, WORLD_RADIUS * 1.1, 0.28, 96),
    new THREE.MeshStandardMaterial({ color: 0x0c1220, roughness: 0.42, metalness: 0.35 })
  );
  base.rotation.x = Math.PI / 2;
  base.position.z = -0.12;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  for (let i = 0; i < 20; i += 1) {
    const start = Math.PI / 2 - i * (Math.PI / 10) - Math.PI / 20;
    const end = start - Math.PI / 10;
    const segment = DART_SEGMENTS[i];
    addWedge(group, 0.58, 0.78, start, end, i % 2 ? segmentColors.cream : segmentColors.dark);
    addWedge(group, 0.18, 0.46, start, end, i % 2 ? segmentColors.dark : segmentColors.cream);
    addWedge(group, 0.46, 0.56, start, end, bonus?.ring === "triple" && bonus.segment === segment ? segmentColors.amber : i % 2 ? segmentColors.green : segmentColors.red, 0.035);
    addWedge(group, 0.78, 0.92, start, end, bonus?.ring === "double" && bonus.segment === segment ? segmentColors.pink : i % 2 ? segmentColors.red : segmentColors.green, 0.04);
    const labelAngle = (start + end) / 2;
    const label = createNumberSprite(String(segment));
    label.position.set(Math.cos(labelAngle) * WORLD_RADIUS * 0.99, Math.sin(labelAngle) * WORLD_RADIUS * 0.99, 0.22);
    group.add(label);
  }

  addRing(group, 0.105, segmentColors.green, worldOffset(bullOffset).x, worldOffset(bullOffset).y, 0.1);
  addRing(group, 0.052, goldenBull ? segmentColors.amber : segmentColors.red, worldOffset(bullOffset).x, worldOffset(bullOffset).y, 0.13, goldenBull);
}

function addWedge(group: THREE.Group, inner: number, outer: number, start: number, end: number, color: number, lift = 0) {
  const shape = new THREE.Shape();
  const steps = 8;
  for (let i = 0; i <= steps; i += 1) {
    const t = start + ((end - start) * i) / steps;
    const x = Math.cos(t) * WORLD_RADIUS * outer;
    const y = Math.sin(t) * WORLD_RADIUS * outer;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i -= 1) {
    const t = start + ((end - start) * i) / steps;
    shape.lineTo(Math.cos(t) * WORLD_RADIUS * inner, Math.sin(t) * WORLD_RADIUS * inner);
  }
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: RING_DEPTH + lift, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.01, bevelSegments: 1 }),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.08, emissive: lift ? color : 0x000000, emissiveIntensity: lift ? 0.15 : 0 })
  );
  mesh.position.z = -0.02;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function addRing(group: THREE.Group, radius: number, color: number, x = 0, y = 0, z = 0.1, glow = false) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(WORLD_RADIUS * radius, WORLD_RADIUS * radius, 0.16, 64),
    new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.12, emissive: glow ? color : 0x000000, emissiveIntensity: glow ? 0.45 : 0 })
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  group.add(mesh);
}

function worldOffset(offset: { x: number; y: number }) {
  return { x: (offset.x / BOARD_SIZE) * WORLD_RADIUS * 2, y: -(offset.y / BOARD_SIZE) * WORLD_RADIUS * 2 };
}

function createDartMesh() {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 1.05, 16),
    new THREE.MeshStandardMaterial({ color: 0xd7deea, roughness: 0.28, metalness: 0.7 })
  );
  shaft.rotation.x = Math.PI / 2;
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.26, 24),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.24, metalness: 0.9 })
  );
  tip.rotation.x = -Math.PI / 2;
  tip.position.z = -0.62;
  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.34, 20),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.32, metalness: 0.5 })
  );
  grip.rotation.x = Math.PI / 2;
  grip.position.z = -0.2;
  const flightMaterial = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i += 1) {
    const flight = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.34), flightMaterial);
    flight.position.z = 0.58;
    flight.rotation.z = (Math.PI / 2) * i;
    flight.rotation.x = Math.PI / 2;
    group.add(flight);
  }
  group.add(shaft, tip, grip);
  group.rotation.x = 0.34;
  group.rotation.z = -0.22;
  return group;
}

function createTrail() {
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.38 }));
}

function createNumberSprite(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, 96, 96);
    context.fillStyle = "rgba(15, 23, 42, 0.74)";
    context.beginPath();
    context.arc(48, 48, 32, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f8fafc";
    context.font = "900 34px Inter, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 48, 49);
  }
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthTest: true
    })
  );
  sprite.scale.set(0.34, 0.34, 0.34);
  return sprite;
}

function setDartPosition(dart: THREE.Group, trail: THREE.Line, x: number, y: number, z: number) {
  const point = boardToWorld(x, y);
  dart.position.set(point.x, point.y, z);
  const positions = trail.geometry.attributes.position as THREE.BufferAttribute;
  positions.setXYZ(0, point.x, point.y, z - 0.1);
  positions.setXYZ(1, point.x - 0.36, point.y - 0.2, z + 0.5);
  positions.needsUpdate = true;
}

function setPulledDartPosition(dart: THREE.Group, trail: THREE.Line, aim: { x: number; y: number }, pull: { x: number; y: number }, power: number) {
  const pullX = aim.x + (pull.x - aim.x) * 0.9;
  const pullY = aim.y + (pull.y - aim.y) * 0.9;
  const point = boardToWorld(pullX, pullY);
  const target = boardToWorld(aim.x, aim.y);
  const angle = Math.atan2(target.y - point.y, target.x - point.x);
  dart.position.set(point.x, point.y, 1.05 + power * 1.55);
  dart.rotation.z = angle - Math.PI / 2;
  dart.rotation.x = 0.48 + power * 0.18;
  const positions = trail.geometry.attributes.position as THREE.BufferAttribute;
  positions.setXYZ(0, point.x, point.y, dart.position.z - 0.14);
  positions.setXYZ(1, target.x, target.y, 0.18);
  positions.needsUpdate = true;
}

function animateDartHit(dart: THREE.Group, trail: THREE.Line, x: number, y: number, resetX: number, resetY: number) {
  const point = boardToWorld(x, y);
  dart.position.set(point.x, point.y, 0.34);
  dart.scale.setScalar(0.92);
  window.setTimeout(() => {
    dart.scale.setScalar(1);
    setDartPosition(dart, trail, resetX, resetY, 1.35);
  }, 180);
}

function addHitMark(marks: THREE.Group, throwResult: DartThrow) {
  const point = boardToWorld(throwResult.x, throwResult.y);
  const mark = new THREE.Mesh(
    new THREE.SphereGeometry(throwResult.isBullseye ? 0.065 : 0.045, 16, 12),
    new THREE.MeshStandardMaterial({ color: throwResult.isBonusHit ? 0xfbbf24 : 0xf8fafc, emissive: throwResult.isBonusHit ? 0xfbbf24 : 0x000000, emissiveIntensity: 0.25 })
  );
  mark.position.set(point.x, point.y, 0.24);
  marks.add(mark);
  while (marks.children.length > 18) marks.remove(marks.children[0]);
}

function addStuckDart(marks: THREE.Group, throwResult: DartThrow) {
  const point = boardToWorld(throwResult.x, throwResult.y);
  const stuck = createDartMesh();
  stuck.position.set(point.x, point.y, 0.38);
  stuck.rotation.x = 0.72;
  stuck.rotation.z = -0.18 + (Math.random() - 0.5) * 0.18;
  stuck.scale.setScalar(0.64);
  marks.add(stuck);
  while (marks.children.length > 30) marks.remove(marks.children[0]);
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else material?.dispose();
  });
}
