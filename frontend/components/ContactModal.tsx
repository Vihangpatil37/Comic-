"use client";

import { useEffect, useRef, useCallback } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactModal({ isOpen, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync open/close state with the native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      // Focus the close button on open
      closeButtonRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Handle native dialog close event (e.g. Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="
        backdrop:bg-ink/40 backdrop:backdrop-blur-none
        bg-transparent p-0 m-auto
        open:animate-modal-in
        max-w-[420px] w-[calc(100vw-48px)]
      "
      aria-label="Contact"
    >
      <div className="bg-paper border border-hairline rounded-sm p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-data text-xs tracking-widest uppercase text-slate">
            Contact
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-slate hover:text-ink transition-colors p-1 -mr-1"
            aria-label="Close contact dialog"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <p className="text-ink text-base mb-8 max-w-[32ch]">
          Have a question, idea, or just want to say hello?
        </p>

        <div className="mb-8">
          <div className="font-data text-xs tracking-wider uppercase text-slate mb-1">
            Email
          </div>
          <a
            href="mailto:Vihangpatil37@gmail.com"
            className="text-ink hover:text-oxide transition-colors text-base"
          >
            Vihangpatil37@gmail.com
          </a>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <a
            href="mailto:Vihangpatil37@gmail.com"
            className="font-data text-xs tracking-wider uppercase text-oxide hover:opacity-70 transition-opacity"
          >
            Send an email →
          </a>
        </div>
      </div>
    </dialog>
  );
}
