"use client";

import { useRef, useEffect, useCallback } from "react";

type Props = {
  currentPage: number;
  zoom: number;
  isLoading: boolean;
  renderPage: (
    canvas: HTMLCanvasElement,
    pageNum: number,
    containerWidth: number,
    containerHeight: number,
    zoomLevel: number
  ) => Promise<void>;
  onClickPrev: () => void;
  onClickNext: () => void;
  onClickCenter: () => void;
};

export default function ComicCanvas({
  currentPage, zoom, isLoading, renderPage,
  onClickPrev, onClickNext, onClickCenter,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const doRender = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    renderPage(canvas, currentPage, rect.width, rect.height, zoom);
  }, [currentPage, zoom, renderPage]);

  // Render on page/zoom change
  useEffect(() => {
    doRender();
  }, [doRender]);

  // Re-render on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      doRender();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [doRender]);

  // Reset scroll position when page changes (not zoom)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [currentPage]);

  // Click zone handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) return; // Don't navigate when zoomed — user is panning

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width * 0.3;

    if (x < third) {
      onClickPrev();
    } else if (x > rect.width - third) {
      onClickNext();
    } else {
      onClickCenter();
    }
  }, [zoom, onClickPrev, onClickNext, onClickCenter]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative select-none"
      style={{ touchAction: zoom > 1 ? "pan-x pan-y" : "none" }}
    >
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-auto flex items-center justify-center custom-scrollbar"
        onClick={handleClick}
        role="img"
        aria-label={`Comic page ${currentPage}`}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            opacity: isLoading ? 0.3 : 1,
            transition: "opacity 150ms ease-out",
            imageRendering: "auto",
          }}
        />
      </div>

      {/* Cursor hints — only when not zoomed */}
      {zoom <= 1 && (
        <>
          <div
            className="absolute inset-y-0 left-0 z-10 pointer-events-none"
            style={{ width: "30%", cursor: "w-resize" }}
          />
          <div
            className="absolute inset-y-0 right-0 z-10 pointer-events-none"
            style={{ width: "30%", cursor: "e-resize" }}
          />
        </>
      )}
    </div>
  );
}
