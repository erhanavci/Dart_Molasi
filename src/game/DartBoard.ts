import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { BonusTarget, DartThrow } from "../types/game";
import { DART_SEGMENTS } from "./ScoreCalculator";

const colors = {
  dark: 0x192238,
  cream: 0xf7f0d2,
  red: 0xf43f5e,
  green: 0x22c55e,
  wire: 0xd9e2ff,
  neon: 0x34d399,
  amber: 0xfbbf24,
  pink: 0xf472b6
};

export class DartBoard {
  public container = new Container();
  private board = new Graphics();
  private marks = new Graphics();
  private labels = new Container();
  private crosshair = new Graphics();
  private pulse = new Graphics();
  private size: number;

  constructor(size: number) {
    this.size = size;
    this.container.addChild(this.board, this.labels, this.pulse, this.marks, this.crosshair);
  }

  resize(size: number) {
    this.size = size;
    this.draw();
  }

  draw(bonus?: BonusTarget, bullOffset = { x: 0, y: 0 }, goldenBull = false) {
    const center = this.size / 2;
    const radius = this.size / 2;
    this.board.clear();
    this.labels.removeChildren();
    this.pulse.clear();

    this.board.circle(center, center, radius).fill(0x0f172a);
    this.board.circle(center, center, radius * 0.94).fill(0x111827).stroke({ width: 3, color: colors.wire, alpha: 0.5 });

    for (let i = 0; i < 20; i += 1) {
      const start = -Math.PI / 2 + i * (Math.PI / 10) - Math.PI / 20;
      const end = start + Math.PI / 10;
      const segment = DART_SEGMENTS[i];
      this.slice(center, radius * 0.58, radius * 0.78, start, end, i % 2 ? colors.cream : colors.dark);
      this.slice(center, radius * 0.18, radius * 0.46, start, end, i % 2 ? colors.dark : colors.cream);
      this.slice(center, radius * 0.46, radius * 0.56, start, end, segment === bonus?.segment && bonus.ring === "triple" ? colors.amber : i % 2 ? colors.green : colors.red);
      this.slice(center, radius * 0.78, radius * 0.92, start, end, segment === bonus?.segment && bonus.ring === "double" ? colors.pink : i % 2 ? colors.red : colors.green);

      const labelAngle = start + Math.PI / 20;
      const label = new Text({
        text: String(segment),
        style: new TextStyle({ fill: 0xffffff, fontSize: Math.max(11, radius * 0.075), fontWeight: "700" })
      });
      label.anchor.set(0.5);
      label.x = center + Math.cos(labelAngle) * radius * 0.84;
      label.y = center + Math.sin(labelAngle) * radius * 0.84;
      this.labels.addChild(label);
    }

    this.board.circle(center + bullOffset.x, center + bullOffset.y, radius * 0.105).fill(0x16a34a).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
    this.board.circle(center + bullOffset.x, center + bullOffset.y, radius * 0.052).fill(goldenBull ? colors.amber : colors.red);

    if (goldenBull) {
      this.pulse.circle(center + bullOffset.x, center + bullOffset.y, radius * 0.12).stroke({ width: 5, color: colors.amber, alpha: 0.65 });
    }

    if (bonus) {
      this.pulse.circle(center, center, bonus.ring === "double" ? radius * 0.86 : radius * 0.51).stroke({
        width: 5,
        color: bonus.ring === "double" ? colors.pink : colors.amber,
        alpha: 0.45
      });
    }
  }

  setAim(x: number, y: number, slow = false) {
    this.crosshair.clear();
    const glow = slow ? colors.amber : colors.neon;
    this.crosshair.circle(x, y, 16).stroke({ width: 3, color: glow, alpha: 0.86 });
    this.crosshair.moveTo(x - 24, y).lineTo(x - 8, y).moveTo(x + 8, y).lineTo(x + 24, y);
    this.crosshair.moveTo(x, y - 24).lineTo(x, y - 8).moveTo(x, y + 8).lineTo(x, y + 24);
    this.crosshair.stroke({ width: 2, color: glow, alpha: 0.92 });
  }

  addThrowMark(throwResult: DartThrow) {
    this.marks.circle(throwResult.x, throwResult.y, throwResult.isBullseye ? 7 : 5).fill(throwResult.isBonusHit ? colors.amber : 0xe5e7eb);
    this.marks.moveTo(throwResult.x - 18, throwResult.y - 10).lineTo(throwResult.x, throwResult.y).lineTo(throwResult.x - 6, throwResult.y - 20);
    this.marks.stroke({ width: 3, color: throwResult.isBonusHit ? colors.amber : 0xffffff, alpha: 0.82 });
  }

  clearMarks() {
    this.marks.clear();
  }

  private slice(center: number, inner: number, outer: number, start: number, end: number, color: number) {
    this.board
      .moveTo(center + Math.cos(start) * inner, center + Math.sin(start) * inner)
      .arc(center, center, inner, start, end)
      .lineTo(center + Math.cos(end) * outer, center + Math.sin(end) * outer)
      .arc(center, center, outer, end, start, true)
      .closePath()
      .fill(color)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.22 });
  }
}
