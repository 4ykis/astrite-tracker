"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "@/components/Modal";
import { COSTS, EchoCost, ECHOES, echoIcon, sonataIcon } from "@/lib/echoes";
import SonataSelect from "./SonataSelect";

const chip = (active: boolean) =>
  `flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
    active
      ? "border-amber-400 bg-amber-400/15 text-amber-200"
      : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100"
  }`;

// Remembered for the whole page session, so the next pick opens with the same filters.
const lastFilter: { sonatas: Set<number>; cost: EchoCost | null } = { sonatas: new Set(), cost: null };

export default function EchoPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const [sonatas, setSonatasState] = useState(lastFilter.sonatas);
  const [cost, setCostState] = useState(lastFilter.cost);

  const setSonatas = (next: Set<number>) => {
    lastFilter.sonatas = next;
    setSonatasState(next);
  };
  const setCost = (next: EchoCost | null) => {
    lastFilter.cost = next;
    setCostState(next);
  };

  const visible = ECHOES.filter(
    (e) => (cost === null || e.cost === cost) && (sonatas.size === 0 || e.sonatas.some((s) => sonatas.has(s))),
  );

  const filters = (
    <div className="flex flex-wrap items-center gap-1.5">
      <SonataSelect value={sonatas} onChange={setSonatas} />
      <button type="button" className={chip(cost === null)} onClick={() => setCost(null)}>
        Усі
      </button>
      {COSTS.map((c) => (
        <button key={c} type="button" className={chip(cost === c)} onClick={() => setCost(c)}>
          Cost {c}
        </button>
      ))}
    </div>
  );

  return (
    <Modal title="Обрати ехо" size="xl" onClose={onClose} header={filters}>
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Нічого не знайдено</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {visible.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect(e.id)}
              className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition hover:border-amber-400 hover:bg-slate-800 ${
                e.id === selected ? "border-amber-400 bg-amber-400/10" : "border-slate-800 bg-slate-950/60"
              }`}
            >
              <span className="absolute top-1.5 right-1.5 rounded bg-slate-950/80 px-1.5 text-[10px] font-semibold text-amber-300">
                {e.cost}
              </span>
              <Image
                src={echoIcon(e.id)}
                alt={e.name}
                width={96}
                height={96}
                unoptimized
                className="aspect-square w-full"
              />
              <span className="line-clamp-2 text-xs text-slate-200">{e.name}</span>
              <span className="flex gap-0.5">
                {e.sonatas.map((s) => (
                  <Image key={s} src={sonataIcon(s)} alt="" width={14} height={14} unoptimized />
                ))}
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
