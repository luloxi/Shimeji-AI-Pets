"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-provider";

export function GiveawayWidget() {
  const { isSpanish } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  function goToFeedback() {
    const formSection = document.getElementById("feedback-form-section");
    formSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-[60] flex items-end gap-2"
    >
      <div
        id="giveaway-panel"
        className={`origin-right overflow-hidden transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto w-[min(78vw,18rem)] max-w-[calc(100vw-5rem)] opacity-100 translate-x-0"
            : "pointer-events-none w-0 opacity-0 translate-x-3"
        }`}
      >
        <div className="rounded-2xl giveaway-border p-[2px] shadow-[0_12px_30px_rgba(17,89,204,0.45)]">
          <div className="rounded-[calc(1rem-2px)] bg-[#1159CC] text-white p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.14em] text-[#FFCC66]">
              {isSpanish ? "Giveaway Shimeji" : "Shimeji Giveaway"}
            </p>
            <p className="mt-1 text-sm md:text-base font-black leading-tight break-words">
              {isSpanish ? "Gana 1 comisión personalizada." : "Win 1 custom commission."}
            </p>
            <p className="mt-1 text-xs md:text-sm leading-snug text-white/90 break-words">
              {isSpanish ? "Sigue a " : "Follow "}
              <Link
                href="https://x.com/shimejidev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline decoration-2 underline-offset-2 text-[#FFCC66] hover:opacity-80"
              >
                @shimejidev
              </Link>
              {isSpanish
                ? " y deja feedback para participar."
                : " and leave feedback to enter."}
            </p>
            <button
              type="button"
              onClick={goToFeedback}
              className="mt-3 h-8 rounded-lg px-3 text-xs font-bold bg-[#1159CC] text-white hover:bg-[#000000]"
            >
              {isSpanish ? "Ir al formulario" : "Go to feedback form"}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls="giveaway-panel"
        className="giveaway-border cursor-pointer rounded-2xl p-[2px] shadow-[0_12px_30px_rgba(17,89,204,0.45)]"
      >
        <div className="rounded-[calc(1rem-2px)] bg-[#1159CC] px-2 py-2">
          <img
            src="/GIVEWAY2.png"
            alt="Open giveaway info"
            className="w-14 md:w-16 h-auto animate-bounce rounded-xl"
          />
          <p className="mt-1 text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-[#FFCC66]">
            {isSpanish ? "Sorteo" : "Giveaway"}
          </p>
        </div>
      </button>

      <style jsx>{`
        .giveaway-border {
          background-size: 300% 300%;
          animation: gradient_301 5s ease infinite;
          background-image: linear-gradient(
            137.48deg,
            #FFCC66 10%,
            #FF6666 45%,
            #FF99CC 67%,
            #1159CC 87%
          );
        }

        @keyframes gradient_301 {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
