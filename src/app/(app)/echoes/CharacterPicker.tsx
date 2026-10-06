"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "@/components/Modal";
import {
  CHARACTERS,
  characterIcon,
  ELEMENT_COLORS,
  elementIcon,
  ELEMENTS,
  WEAPON_TYPES,
  weaponTypeIcon,
} from "@/lib/echoes";
import { FilterDivider, IconToggle, matchesSearch, SearchInput, toggle } from "./PickerFilters";

export default function CharacterPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  // Filters start fresh every time the picker opens.
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<number | null>(null);
  const [weaponType, setWeaponType] = useState<number | null>(null);

  const visible = CHARACTERS.filter(
    (c) =>
      matchesSearch(c.name, query) &&
      (element === null || c.element === element) &&
      (weaponType === null || c.weaponType === weaponType),
  );

  const filters = (
    <div className="flex flex-wrap items-center gap-1">
      <SearchInput value={query} onChange={setQuery} />
      {ELEMENTS.map((name, i) => (
        <IconToggle
          key={name}
          icon={elementIcon(i + 1)}
          label={name}
          color={ELEMENT_COLORS[i]}
          active={element === i + 1}
          onClick={() => setElement(toggle(element, i + 1))}
        />
      ))}
      <FilterDivider />
      {Object.entries(WEAPON_TYPES).map(([id, name]) => (
        <IconToggle
          key={id}
          icon={weaponTypeIcon(Number(id))}
          label={name}
          active={weaponType === Number(id)}
          onClick={() => setWeaponType(toggle(weaponType, Number(id)))}
        />
      ))}
    </div>
  );

  return (
    <Modal title="Обрати героя" size="xl" onClose={onClose} header={filters}>
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Нічого не знайдено</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {visible.map((c) => (
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
      )}
    </Modal>
  );
}
