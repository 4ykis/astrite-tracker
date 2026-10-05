"use client";

import Modal from "@/components/Modal";
import { Character, formatPercent, STAT_LABELS, Weapon, WEAPON_TYPES, weaponsFor } from "@/lib/echoes";
import WeaponIcon from "./WeaponIcon";

export const weaponSecondary = (weapon: Weapon) =>
  `${STAT_LABELS[weapon.secondary.stat] ?? weapon.secondary.stat} ${formatPercent(weapon.secondary.value)}`;

export default function WeaponPicker({
  character,
  selected,
  onSelect,
  onClose,
}: {
  character: Character | undefined;
  selected: number | null;
  onSelect: (id: number | null) => void;
  onClose: () => void;
}) {
  const type = character ? WEAPON_TYPES[character.weaponType] : undefined;

  return (
    <Modal title={type ? `Обрати зброю — ${type}` : "Обрати зброю"} size="xl" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {weaponsFor(character).map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onSelect(w.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition hover:border-amber-400 hover:bg-slate-800 ${
              w.id === selected ? "border-amber-400 bg-amber-400/10" : "border-slate-800 bg-slate-950/60"
            }`}
          >
            <WeaponIcon weapon={w} className="aspect-square w-full text-lg" />
            <span className="line-clamp-2 text-xs text-slate-200">{w.name}</span>
            <span className="text-[11px] text-slate-500">{weaponSecondary(w)}</span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-4 w-full rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-500 transition hover:border-red-900 hover:text-red-300"
        >
          Без зброї
        </button>
      )}
    </Modal>
  );
}
