"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist";

// Lazy-load pdfjs-dist only on the client
let pdfjsLib: typeof import("pdfjs-dist") | null = null;
async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import("pdfjs-dist");
  // Use CDN worker matching the installed version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  return pdfjsLib;
}

export type PdfReaderState = {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isLoading: boolean;
  isDocumentLoading: boolean;
  error: string | null;
};

export type PdfReaderActions = {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  resetZoom: () => void;
  retry: () => void;
  renderPage: (
    canvas: HTMLCanvasElement,
    pageNum: number,
    containerWidth: number,
    containerHeight: number,
    zoomLevel: number
  ) => Promise<void>;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function usePdfReader(pdfUrl: string | null): [PdfReaderState, PdfReaderActions] {
  const [state, setState] = useState<PdfReaderState>({
    currentPage: 1,
    totalPages: 0,
    zoom: 1,
    isLoading: true,
    isDocumentLoading: true,
    error: null,
  });

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const pagesCacheRef = useRef<Map<number, PDFPageProxy>>(new Map());

  // Load the PDF document (once per URL)
  const loadDocument = useCallback(async () => {
    if (!pdfUrl) return;

    setState(prev => ({ ...prev, isDocumentLoading: true, isLoading: true, error: null }));

    try {
      const pdfjs = await getPdfjs();

      // Clean up previous document
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
        pagesCacheRef.current.clear();
      }

      const loadingTask = pdfjs.getDocument({
        url: pdfUrl,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
      });

      const doc = await loadingTask.promise;
      pdfDocRef.current = doc;

      setState(prev => ({
        ...prev,
        totalPages: doc.numPages,
        isDocumentLoading: false,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      console.error("[PDF Reader] Failed to load document:", err);
      setState(prev => ({
        ...prev,
        isDocumentLoading: false,
        isLoading: false,
        error: "Couldn't load this comic.",
      }));
    }
  }, [pdfUrl]);

  useEffect(() => {
    loadDocument();

    return () => {
      // Cleanup on unmount
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
      pagesCacheRef.current.clear();
    };
  }, [loadDocument]);

  // Get a page (with caching)
  const getPage = useCallback(async (pageNum: number): Promise<PDFPageProxy> => {
    const cached = pagesCacheRef.current.get(pageNum);
    if (cached) return cached;

    const doc = pdfDocRef.current;
    if (!doc) throw new Error("No document loaded");

    const page = await doc.getPage(pageNum);
    pagesCacheRef.current.set(pageNum, page);

    // Keep cache bounded to ~5 pages
    if (pagesCacheRef.current.size > 5) {
      const keys = Array.from(pagesCacheRef.current.keys());
      const toRemove = keys.filter(k => Math.abs(k - pageNum) > 2);
      toRemove.forEach(k => pagesCacheRef.current.delete(k));
    }

    return page;
  }, []);

  const renderCounterRef = useRef<number>(0);

  // Render a specific page to a canvas
  const renderPage = useCallback(async (
    canvas: HTMLCanvasElement,
    pageNum: number,
    containerWidth: number,
    containerHeight: number,
    zoomLevel: number
  ) => {
    if (!pdfDocRef.current) return;

    const renderId = ++renderCounterRef.current;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      try {
        await renderTaskRef.current.promise;
      } catch (err) {
        // Expected cancellation
      }
      renderTaskRef.current = null;
    }

    // If another render was triggered while we waited for cancellation, abort
    if (renderId !== renderCounterRef.current) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const page = await getPage(pageNum);
      
      // If another render was triggered while fetching the page, abort
      if (renderId !== renderCounterRef.current) return;

      const unscaledViewport = page.getViewport({ scale: 1 });

      // Calculate scale to fit the container while preserving aspect ratio
      const scaleX = containerWidth / unscaledViewport.width;
      const scaleY = containerHeight / unscaledViewport.height;
      const fitScale = Math.min(scaleX, scaleY);

      const effectiveScale = fitScale * zoomLevel;
      const dpr = window.devicePixelRatio || 1;
      // Cap DPR to 2 to avoid excessively large canvases
      const cappedDpr = Math.min(dpr, 2);

      const viewport = page.getViewport({ scale: effectiveScale });

      // Set canvas dimensions for sharp rendering
      canvas.width = Math.floor(viewport.width * cappedDpr);
      canvas.height = Math.floor(viewport.height * cappedDpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      ctx.setTransform(cappedDpr, 0, 0, cappedDpr, 0, 0);

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      });
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;

      if (renderId === renderCounterRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err: any) {
      if (err?.name === "RenderingCancelled") {
        // Expected when quickly flipping pages — not an error
        return;
      }
      console.error("[PDF Reader] Render error:", err);
      if (renderId === renderCounterRef.current) {
        setState(prev => ({ ...prev, isLoading: false, error: "Couldn't load this page." }));
      }
    }
  }, [getPage]);

  // Preload adjacent pages (silent, non-blocking)
  const preloadAdjacent = useCallback((pageNum: number) => {
    const doc = pdfDocRef.current;
    if (!doc) return;

    const pagesToPreload = [pageNum - 1, pageNum + 1].filter(
      p => p >= 1 && p <= doc.numPages
    );

    pagesToPreload.forEach(p => {
      if (!pagesCacheRef.current.has(p)) {
        doc.getPage(p).then(page => {
          pagesCacheRef.current.set(p, page);
        }).catch(() => { /* silent preload failure */ });
      }
    });
  }, []);

  // Navigation actions
  const goToPage = useCallback((page: number) => {
    setState(prev => {
      const clamped = Math.max(1, Math.min(page, prev.totalPages || 1));
      if (clamped === prev.currentPage) return prev;
      return { ...prev, currentPage: clamped };
    });
  }, []);

  const nextPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage >= prev.totalPages) return prev;
      return { ...prev, currentPage: prev.currentPage + 1 };
    });
  }, []);

  const prevPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage <= 1) return prev;
      return { ...prev, currentPage: prev.currentPage - 1 };
    });
  }, []);

  const setZoom = useCallback((zoomOrFn: number | ((prev: number) => number)) => {
    setState(prev => {
      const newZoom = typeof zoomOrFn === "function" ? zoomOrFn(prev.zoom) : zoomOrFn;
      const clamped = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));
      return { ...prev, zoom: clamped };
    });
  }, []);

  const resetZoom = useCallback(() => {
    setState(prev => ({ ...prev, zoom: 1 }));
  }, []);

  const retry = useCallback(() => {
    loadDocument();
  }, [loadDocument]);

  // Trigger preload whenever current page changes
  useEffect(() => {
    if (state.totalPages > 0) {
      preloadAdjacent(state.currentPage);
    }
  }, [state.currentPage, state.totalPages, preloadAdjacent]);

  return [
    state,
    { goToPage, nextPage, prevPage, setZoom, resetZoom, retry, renderPage },
  ];
}
