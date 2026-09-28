"use client";

import Modal from "@/components/Modal";
import { Stat } from "@/lib/echoes";

export default function StatPicker({
  title,
  stats,
  selected,
  taken,
  onSelect,
  onClose,
}: {
  title: string;
  stats: Stat[];
  selected: string | null;
  /** Keys already used elsewhere on the same echo. */
  taken?: Set<string>;
  onSelect: (key: string | null) => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-1.5">
        {stats.map((s) => {
          const isSelected = s.key === selected;
          const isTaken = !isSelected && taken?.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              disabled={isTaken}
              onClick={() => onSelect(s.key)}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${
                isSelected
                  ? "border-amber-400 bg-amber-400/10 text-amber-200"
                  : "border-slate-800 bg-slate-950/60 text-slate-200 enabled:hover:border-slate-600 enabled:hover:bg-slate-800"
              }`}
            >
              <span>{s.label}</span>
              <span className="text-xs text-slate-400">({s.hint})</span>
            </button>
          );
        })}
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="mt-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-500 transition hover:border-red-900 hover:text-red-300"
          >
            Очистити
          </button>
        )}
      </div>
    </Modal>
  );
}
