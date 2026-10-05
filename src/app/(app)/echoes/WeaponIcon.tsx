"use client";

import Image from "next/image";
import { useState } from "react";
import { Weapon, weaponIcon } from "@/lib/echoes";

const RANK_BG: Record<number, string> = {
  5: "bg-amber-400/15",
  4: "bg-violet-500/15",
  3: "bg-sky-500/15",
};

/** Weapon icon tinted by rarity; shows initials if the icon file is missing. */
export default function WeaponIcon({ weapon, className = "" }: { weapon: Weapon; className?: string }) {
  const [failed, setFailed] = useState(false);
  const bg = RANK_BG[weapon.rank] ?? "bg-slate-500/15";

  if (failed) {
    const initials = weapon.name
      .split(/[\s:-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return (
      <span
        title={weapon.name}
        className={`flex items-center justify-center rounded-lg font-semibold text-slate-300 ${bg} ${className}`}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={weaponIcon(weapon.id)}
      alt={weapon.name}
      width={96}
      height={96}
      unoptimized
      onError={() => setFailed(true)}
      className={`rounded-lg ${bg} ${className}`}
    />
  );
}
