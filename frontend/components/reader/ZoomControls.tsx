"use client";

type Props = {
  zoom: number;
  visible: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export default function ZoomControls({ zoom, visible, onZoomIn, onZoomOut, onReset }: Props) {
  const pct = Math.round(zoom * 100);

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-sm px-2 py-1.5 transition-opacity duration-300"
      style={{
        backgroundColor: "rgba(21, 23, 24, 0.75)",
        border: "1px solid rgba(255,255,255,0.10)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onZoomOut(); }}
        disabled={zoom <= 1}
        className="px-2 py-0.5 text-sm font-data transition-colors disabled:opacity-30"
        style={{ color: "#EAEAEA" }}
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onReset(); }}
        className="px-2 py-0.5 text-xs font-data transition-colors min-w-[3.5rem] text-center"
        style={{ color: "#858585" }}
        aria-label={`Current zoom: ${pct}%. Click to reset.`}
      >
        {pct}%
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onZoomIn(); }}
        disabled={zoom >= 4}
        className="px-2 py-0.5 text-sm font-data transition-colors disabled:opacity-30"
        style={{ color: "#EAEAEA" }}
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
}
