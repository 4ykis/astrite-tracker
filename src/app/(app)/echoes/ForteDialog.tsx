"use client";

import Modal from "@/components/Modal";
import { Character, FORTE_ALL, isForteOn, STAT_LABELS } from "@/lib/echoes";

const byStat = (character: Character) => {
  const stats = [...new Set(character.forte.map((node) => node.stat))];
  return character.forte
    .map((_, i) => i)
    .sort((a, b) => {
      const [x, y] = [character.forte[a], character.forte[b]];
      return stats.indexOf(x.stat) - stats.indexOf(y.stat) || x.value - y.value || a - b;
    });
};

/** Toggles for the 8 minor forte stat nodes; the result is a bitmask (see `EchoBuild.forteNodes`). */
export default function ForteDialog({
  character,
  mask,
  onChange,
  onClose,
}: {
  character: Character;
  mask: number;
  onChange: (mask: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`Forte — ${character.name}`} onClose={onClose}>
      {/* One column per bonus type, smaller node first; bits still follow the data order. */}
      <div className="grid grid-flow-col grid-cols-2 grid-rows-4 gap-1.5">
        {byStat(character).map((i) => {
          const node = character.forte[i];
          const on = isForteOn(mask, i);
          return (
            <label
              key={i}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition ${
                on
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange(mask ^ (1 << i))}
                className="size-3.5 shrink-0 cursor-pointer accent-emerald-500"
              />
              <span className="flex-1 truncate">{STAT_LABELS[node.stat] ?? node.stat}</span>
              <span className="tabular-nums">+{node.value}%</span>
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(FORTE_ALL)}
          className="flex-1 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-200"
        >
          Усі
        </button>
        <button
          type="button"
          onClick={() => onChange(0)}
          className="flex-1 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
        >
          Жодного
        </button>
      </div>
    </Modal>
  );
}
