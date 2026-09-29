"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SONATAS, SONATA_BY_ID, sonataIcon } from "@/lib/echoes";

/** Multi-select dropdown of sonata sets; an empty selection means "all". */
export default function SonataSelect({
  value,
  onChange,
}: {
  value: Set<number>;
  onChange: (next: Set<number>) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const toggle = (id: number) => {
    const next = new Set(value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const [first] = value;
  const label =
    value.size === 0 ? "Усі сонати" : value.size === 1 ? SONATA_BY_ID.get(first)?.name : `Сонат: ${value.size}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-60 items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition ${
          value.size > 0
            ? "border-amber-400 bg-amber-400/15 text-amber-200"
            : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100"
        }`}
      >
        {value.size === 1 && <Image src={sonataIcon(first)} alt="" width={16} height={16} unoptimized />}
        <span className="flex-1 truncate">{label}</span>
        <span className={`text-slate-500 transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-10 mt-1 flex max-h-80 w-72 flex-col overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className={`rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-slate-800 ${
              value.size === 0 ? "text-amber-200" : "text-slate-300"
            }`}
          >
            Усі сонати
          </button>
          {SONATAS.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
            >
              <input
                type="checkbox"
                checked={value.has(s.id)}
                onChange={() => toggle(s.id)}
                className="size-3.5 accent-amber-400"
              />
              <Image src={sonataIcon(s.id)} alt="" width={16} height={16} unoptimized />
              <span className="truncate">{s.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
