"use client";

export default function ReaderLoading() {
  return (
    <div className="flex items-center justify-center flex-1">
      <div
        className="animate-pulse rounded-sm"
        style={{
          width: "min(80vw, 50vh)",
          aspectRatio: "2 / 3",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        }}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-sm" style={{ color: "#858585" }}>
            Loading…
          </span>
        </div>
      </div>
    </div>
  );
}
