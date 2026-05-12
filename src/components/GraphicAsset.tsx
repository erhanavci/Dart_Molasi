type GraphicKey =
  | "logo"
  | "greenDart"
  | "redDart"
  | "blueDart"
  | "coffee"
  | "focus"
  | "meeting"
  | "postit"
  | "playButton"
  | "modeButton"
  | "replayButton"
  | "homeButton"
  | "bullseyePop"
  | "combo2"
  | "combo3"
  | "bonusTarget"
  | "bossAlert"
  | "scorePanel"
  | "bossBar"
  | "coinGold"
  | "starGold"
  | "diamond";

const SHEET = "/assets/dart-molasi-graphics.png";
const SHEET_W = 1491;
const SHEET_H = 1055;

const sprites: Record<GraphicKey, { x: number; y: number; w: number; h: number }> = {
  logo: { x: 45, y: 28, w: 340, h: 150 },
  blueDart: { x: 38, y: 225, w: 110, h: 230 },
  redDart: { x: 178, y: 210, w: 105, h: 250 },
  greenDart: { x: 297, y: 210, w: 115, h: 250 },
  coffee: { x: 42, y: 505, w: 118, h: 112 },
  focus: { x: 203, y: 500, w: 124, h: 116 },
  meeting: { x: 368, y: 498, w: 112, h: 122 },
  postit: { x: 510, y: 505, w: 110, h: 115 },
  playButton: { x: 700, y: 516, w: 183, h: 92 },
  modeButton: { x: 893, y: 515, w: 181, h: 93 },
  replayButton: { x: 1093, y: 516, w: 179, h: 92 },
  homeButton: { x: 1281, y: 516, w: 178, h: 92 },
  bullseyePop: { x: 33, y: 710, w: 165, h: 82 },
  combo2: { x: 230, y: 705, w: 150, h: 80 },
  combo3: { x: 401, y: 707, w: 154, h: 80 },
  bonusTarget: { x: 45, y: 812, w: 150, h: 77 },
  bossAlert: { x: 219, y: 814, w: 150, h: 72 },
  scorePanel: { x: 864, y: 707, w: 242, h: 184 },
  bossBar: { x: 1128, y: 708, w: 300, h: 158 },
  coinGold: { x: 30, y: 950, w: 76, h: 76 },
  starGold: { x: 314, y: 950, w: 79, h: 76 },
  diamond: { x: 474, y: 954, w: 82, h: 70 }
};

interface GraphicAssetProps {
  name: GraphicKey;
  className?: string;
  label?: string;
}

export default function GraphicAsset({ name, className = "", label }: GraphicAssetProps) {
  const sprite = sprites[name];
  return (
    <span
      className={`inline-block bg-no-repeat align-middle ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      style={{
        aspectRatio: `${sprite.w} / ${sprite.h}`,
        backgroundImage: `url(${SHEET})`,
        backgroundPosition: `${(sprite.x / (SHEET_W - sprite.w)) * 100}% ${(sprite.y / (SHEET_H - sprite.h)) * 100}%`,
        backgroundSize: `${(SHEET_W / sprite.w) * 100}% ${(SHEET_H / sprite.h) * 100}%`
      }}
    />
  );
}
