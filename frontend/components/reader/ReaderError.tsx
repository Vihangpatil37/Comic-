"use client";

type Props = {
  message?: string;
  onRetry: () => void;
};

export default function ReaderError({ message, onRetry }: Props) {
  return (
    <div className="flex items-center justify-center flex-1">
      <div className="text-center px-6">
        <p className="text-lg mb-6" style={{ color: "#EAEAEA" }}>
          {message || "Couldn't load this comic."}
        </p>
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-sm text-sm font-body transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "var(--color-oxide, #8B3A2A)",
            color: "#EAEAEA",
          }}
          aria-label="Try loading the comic again"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
