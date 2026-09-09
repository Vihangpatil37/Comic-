"use client";

type Props = {
  currentPage: number;
  totalPages: number;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function ReaderFooter({ currentPage, totalPages, visible, onPrev, onNext }: Props) {
  return (
    <footer
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 md:px-8 md:py-5 transition-opacity duration-300"
      style={{
        background: "linear-gradient(to top, rgba(21,23,24,0.85), transparent)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={currentPage <= 1}
        className="text-sm md:text-base font-body transition-colors disabled:invisible"
        style={{ color: "#858585" }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.color = "#EAEAEA"; }}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#858585")}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={currentPage >= totalPages && totalPages > 0}
        className="text-sm md:text-base font-body transition-colors disabled:invisible"
        style={{ color: "#858585" }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.color = "#EAEAEA"; }}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#858585")}
        aria-label="Next page"
      >
        Next →
      </button>
    </footer>
  );
}
