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

const assetFiles: Record<GraphicKey, string> = {
  logo: "logo",
  blueDart: "dart-blue",
  redDart: "dart-red",
  greenDart: "dart-green",
  coffee: "coffee",
  focus: "focus",
  meeting: "meeting",
  postit: "postit",
  playButton: "btn-play",
  modeButton: "btn-mode",
  replayButton: "btn-replay",
  homeButton: "btn-home",
  bullseyePop: "bullseye-pop",
  combo2: "combo2",
  combo3: "combo3",
  bonusTarget: "bonus-target",
  bossAlert: "boss-alert",
  scorePanel: "score-panel",
  bossBar: "boss-bar",
  coinGold: "coin-gold",
  starGold: "star-gold",
  diamond: "diamond"
};

interface GraphicAssetProps {
  name: GraphicKey;
  className?: string;
  label?: string;
}

export default function GraphicAsset({ name, className = "", label }: GraphicAssetProps) {
  return (
    <img
      className={`inline-block max-w-full select-none object-contain align-middle ${className}`}
      src={`/assets/game-ui/${assetFiles[name]}.png`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
    />
  );
}
