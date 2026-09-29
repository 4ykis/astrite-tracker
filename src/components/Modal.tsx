"use client";

import { useEffect, useRef } from "react";

export default function Modal({
  title,
  onClose,
  size = "md",
  header,
  children,
}: {
  title: string;
  onClose: () => void;
  size?: "md" | "xl";
  /** Extra content pinned under the title (e.g. filters). */
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl ${
          size === "xl" ? "min-h-[60vh] max-w-5xl" : "max-w-md"
        }`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-slate-100">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              className="rounded-md px-2 text-xl leading-none text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            >
              ×
            </button>
          </div>
          {header}
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
