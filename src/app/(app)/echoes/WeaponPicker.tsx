"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { Character, formatPercent, STAT_LABELS, Weapon, WEAPON_TYPES, WEAPONS, weaponTypeIcon } from "@/lib/echoes";
import { FilterDivider, IconToggle, matchesSearch, SearchInput, TextToggle, toggle } from "./PickerFilters";
import WeaponIcon from "./WeaponIcon";

export const weaponSecondary = (weapon: Weapon) =>
  `${STAT_LABELS[weapon.secondary.stat] ?? weapon.secondary.stat} ${formatPercent(weapon.secondary.value)}`;

const RARITIES = [5, 4, 3];

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
  // Filters start fresh every time the picker opens, on the character's own weapon type.
  const [query, setQuery] = useState("");
  const [weaponType, setWeaponType] = useState<number | null>(character?.weaponType ?? null);
  const [rarity, setRarity] = useState<number | null>(null);

  const visible = WEAPONS.filter(
    (w) =>
      matchesSearch(w.name, query) &&
      (weaponType === null || w.type === weaponType) &&
      (rarity === null || w.rank === rarity),
  );
  // Other types can be browsed but not equipped: a character only holds its own weapon type.
  const fits = (w: Weapon) => !character || w.type === character.weaponType;

  const filters = (
    <div className="flex flex-wrap items-center gap-1">
      <SearchInput value={query} onChange={setQuery} />
      {Object.entries(WEAPON_TYPES).map(([id, name]) => (
        <IconToggle
          key={id}
          icon={weaponTypeIcon(Number(id))}
          label={name}
          active={weaponType === Number(id)}
          onClick={() => setWeaponType(toggle(weaponType, Number(id)))}
        />
      ))}
      <FilterDivider />
      {RARITIES.map((r) => (
        <TextToggle key={r} active={rarity === r} onClick={() => setRarity(toggle(rarity, r))}>
          {r}★
        </TextToggle>
      ))}
    </div>
  );

  return (
    <Modal title="Обрати зброю" size="xl" onClose={onClose} header={filters}>
      {visible.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Нічого не знайдено</p>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {visible.map((w) => (
          <button
            key={w.id}
            type="button"
            disabled={!fits(w)}
            title={fits(w) ? undefined : `${character?.name} не може тримати ${WEAPON_TYPES[w.type]}`}
            onClick={() => onSelect(w.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition enabled:hover:border-amber-400 enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 ${
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
