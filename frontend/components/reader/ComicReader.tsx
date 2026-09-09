"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchComic, fetchComicReadUrl } from "@/lib/api-client";
import { usePdfReader } from "@/hooks/usePdfReader";
import type { ComicDetail } from "../../../shared/types/comic";

import ReaderHeader from "./ReaderHeader";
import ReaderFooter from "./ReaderFooter";
import ComicCanvas from "./ComicCanvas";
import ZoomControls from "./ZoomControls";
import ReaderLoading from "./ReaderLoading";
import ReaderError from "./ReaderError";

type Props = { slug: string };

export default function ComicReader({ slug }: Props) {
  const router = useRouter();

  // Data loading
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // PDF reader hook
  const [readerState, readerActions] = usePdfReader(pdfUrl);

  // UI state
  const [showChrome, setShowChrome] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chromeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch state for swipe
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // ─── Data fetch ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [c, readInfo] = await Promise.all([
        fetchComic(slug),
        fetchComicReadUrl(slug),
      ]);
      setComic(c);
      setPdfUrl(readInfo.pdfUrl);
    } catch (err: any) {
      if (err.message === "not_found") {
        router.push("/404");
        return;
      }
      setDataError("Couldn't load this comic.");
    } finally {
      setDataLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Chrome auto-hide ────────────────────────────────────
  const wakeChrome = useCallback(() => {
    setShowChrome(true);
    if (chromeTimeoutRef.current) clearTimeout(chromeTimeoutRef.current);
    chromeTimeoutRef.current = setTimeout(() => setShowChrome(false), 3000);
  }, []);

  useEffect(() => {
    wakeChrome();
    return () => {
      if (chromeTimeoutRef.current) clearTimeout(chromeTimeoutRef.current);
    };
  }, [wakeChrome]);

  // ─── Fullscreen ──────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ─── Keyboard ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      wakeChrome();

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          readerActions.nextPage();
          break;
        case "ArrowLeft":
          e.preventDefault();
          readerActions.prevPage();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case "=":
        case "+":
          e.preventDefault();
          readerActions.setZoom(prev => prev + 0.25);
          break;
        case "-":
          e.preventDefault();
          readerActions.setZoom(prev => prev - 0.25);
          break;
        case "0":
          e.preventDefault();
          readerActions.resetZoom();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readerActions, toggleFullscreen, wakeChrome]);

  // ─── Touch / Swipe ──────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    wakeChrome();
    if (readerState.zoom > 1) return; // Don't swipe-navigate when zoomed
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, [wakeChrome, readerState.zoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    setTouchStart(null);

    // Require horizontal movement > 50px and more horizontal than vertical
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) readerActions.prevPage(); // Swipe right → previous
      else readerActions.nextPage();         // Swipe left → next
    }
  }, [touchStart, readerActions]);

  // ─── Render ──────────────────────────────────────────────

  // Data loading / error states
  if (dataLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#151718" }}>
        <ReaderLoading />
      </div>
    );
  }

  if (dataError || !comic) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#151718" }}>
        <ReaderError message={dataError || undefined} onRetry={loadData} />
      </div>
    );
  }

  // PDF document error
  if (readerState.error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#151718" }}>
        <ReaderError message={readerState.error} onRetry={readerActions.retry} />
      </div>
    );
  }

  // PDF document still loading
  if (readerState.isDocumentLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#151718" }}>
        <ReaderLoading />
      </div>
    );
  }

  const { currentPage, totalPages, zoom } = readerState;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#151718" }}
      onMouseMove={wakeChrome}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ReaderHeader
        comicSlug={comic.slug}
        comicTitle={comic.title}
        currentPage={currentPage}
        totalPages={totalPages}
        isFullscreen={isFullscreen}
        visible={showChrome}
        onToggleFullscreen={toggleFullscreen}
      />

      <ComicCanvas
        currentPage={currentPage}
        zoom={zoom}
        isLoading={readerState.isLoading}
        renderPage={readerActions.renderPage}
        onClickPrev={() => { wakeChrome(); readerActions.prevPage(); }}
        onClickNext={() => { wakeChrome(); readerActions.nextPage(); }}
        onClickCenter={() => setShowChrome(prev => !prev)}
      />

      {zoom > 1 && (
        <ZoomControls
          zoom={zoom}
          visible={showChrome}
          onZoomIn={() => readerActions.setZoom(prev => prev + 0.25)}
          onZoomOut={() => readerActions.setZoom(prev => prev - 0.25)}
          onReset={readerActions.resetZoom}
        />
      )}

      <ReaderFooter
        currentPage={currentPage}
        totalPages={totalPages}
        visible={showChrome}
        onPrev={() => { wakeChrome(); readerActions.prevPage(); }}
        onNext={() => { wakeChrome(); readerActions.nextPage(); }}
      />
    </div>
  );
}
