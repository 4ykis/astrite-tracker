"use client";

import { useTransition } from "react";
import { BannerType } from "@prisma/client";
import { incrementPity, recordFiveStar, resetPity } from "./actions";
import { HARD_PITY, PULL_COST, SOFT_PITY, PityInfo } from "@/lib/gacha";

const BANNER_LABEL: Record<BannerType, string> = {
  CHARACTER: "Персонажі",
  WEAPON: "Зброя",
};

export default function PityBlock({ pity }: { pity: PityInfo[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {pity.map((p) => {
        const progress = Math.min(100, (p.currentPity / HARD_PITY) * 100);
        const isSoft = p.currentPity >= SOFT_PITY;

        return (
          <div key={p.bannerType} className="flex flex-col gap-3 rounded-xl bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                {BANNER_LABEL[p.bannerType]}
              </span>
              <span className={`text-sm font-semibold ${isSoft ? "text-amber-300" : "text-slate-200"}`}>
                {p.currentPity} / {HARD_PITY}
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${isSoft ? "bg-amber-400" : "bg-indigo-400"}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {p.lastPull && (
              <p className="text-xs text-slate-500">
                Останній 5★: {p.lastPull.itemName} (піті {p.lastPull.pityAtPull},{" "}
                {p.lastPull.result === "WIN" ? "виграш" : "програш"})
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => incrementPity(p.bannerType, 1))}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-amber-400 hover:text-amber-300 disabled:opacity-60"
              >
                +1 (-{PULL_COST})
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => incrementPity(p.bannerType, 10))}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-amber-400 hover:text-amber-300 disabled:opacity-60"
              >
                +10 (-{PULL_COST * 10})
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => recordFiveStar(p.bannerType, "WIN"))}
                className="rounded-lg border border-emerald-800 px-3 py-1.5 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-950 disabled:opacity-60"
              >
                Win
              </button>
              {p.bannerType === "CHARACTER" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => recordFiveStar(p.bannerType, "LOSE"))}
                  className="rounded-lg border border-red-900 px-3 py-1.5 text-sm text-red-300 transition hover:border-red-500 hover:bg-red-950 disabled:opacity-60"
                >
                  Lose
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => resetPity(p.bannerType))}
                className="rounded-lg border border-slate-800 px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-60"
              >
                Скинути
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
