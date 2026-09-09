"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import ContactModal from "./ContactModal";

export default function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setIsContactOpen(false);
    // Return focus to trigger after modal closes
    triggerRef.current?.focus();
  };

  return (
    <>
      <footer className="p-6 lg:p-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Comic Archive"
            width={120}
            height={36}
            style={{ width: "auto", height: "auto" }}
          />
          <p className="text-slate text-sm">
            © {new Date().getFullYear()} Comic Archive
          </p>
        </div>

        <button
          ref={triggerRef}
          onClick={() => setIsContactOpen(true)}
          className="font-data text-xs tracking-wider uppercase text-slate hover:text-ink transition-colors"
          aria-haspopup="dialog"
        >
          Contact →
        </button>
      </footer>

      <ContactModal isOpen={isContactOpen} onClose={handleClose} />
    </>
  );
}
