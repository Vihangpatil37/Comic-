"use client";

import Link from "next/link";

type Props = {
  comicSlug: string;
  comicTitle: string;
  currentPage: number;
  totalPages: number;
  isFullscreen: boolean;
  visible: boolean;
  onToggleFullscreen: () => void;
};

export default function ReaderHeader({
  comicSlug, comicTitle, currentPage, totalPages,
  isFullscreen, visible, onToggleFullscreen,
}: Props) {
  return (
    <header
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 transition-opacity duration-300"
      style={{
        background: "linear-gradient(to bottom, rgba(21,23,24,0.85), transparent)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <Link
        href={`/comic/${comicSlug}`}
        className="text-sm md:text-base transition-colors shrink-0"
        style={{ color: "#858585" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#EAEAEA")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#858585")}
        onClick={(e) => e.stopPropagation()}
        aria-label="Back to comic detail page"
      >
        ← Back
      </Link>

      <h1
        className="font-display text-base md:text-lg truncate mx-4 text-center flex-1"
        style={{ color: "#EAEAEA" }}
      >
        {comicTitle}
      </h1>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className="font-data text-xs md:text-sm"
          style={{ color: "#858585" }}
          role="status"
          aria-live="polite"
          aria-label={`Page ${currentPage} of ${totalPages}`}
        >
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFullscreen(); }}
          className="p-1 text-lg transition-colors"
          style={{ color: "#858585" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EAEAEA")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#858585")}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? "⛶" : "⛶"}
        </button>
      </div>
    </header>
  );
}
