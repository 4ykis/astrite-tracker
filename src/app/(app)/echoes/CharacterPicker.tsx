"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import { CHARACTERS, characterIcon } from "@/lib/echoes";

export default function CharacterPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Обрати героя" size="xl" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition hover:border-amber-400 hover:bg-slate-800 ${
              c.id === selected ? "border-amber-400 bg-amber-400/10" : "border-slate-800 bg-slate-950/60"
            }`}
          >
            <Image
              src={characterIcon(c.id)}
              alt={c.name}
              width={96}
              height={96}
              unoptimized
              className={`aspect-square w-full rounded-lg ${c.rank === 5 ? "bg-amber-400/15" : "bg-violet-500/15"}`}
            />
            <span className="line-clamp-2 text-xs text-slate-200">{c.name}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
