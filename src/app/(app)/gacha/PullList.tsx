"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PullEntry } from "@prisma/client";
import { deletePullEntry, updatePullEntry } from "./actions";

const BANNER_LABEL = { CHARACTER: "Персонаж", WEAPON: "Зброя" } as const;

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function EditRow({ entry, onDone }: { entry: PullEntry; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState(
    updatePullEntry.bind(null, entry.id),
    undefined,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      onDone();
    }
    wasPending.current = isPending;
  }, [isPending, state, onDone]);

  return (
    <li className="flex flex-col gap-2 py-3">
      <form action={formAction} className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={toDateInputValue(entry.date)}
            required
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
          />
          <select
            name="bannerType"
            defaultValue={entry.bannerType}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
          >
            <option value="CHARACTER">Персонаж</option>
            <option value="WEAPON">Зброя</option>
          </select>
          <select
            name="result"
            defaultValue={entry.result}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
          >
            <option value="WIN">Win (рейтап)</option>
            <option value="LOSE">Lose (стандарт)</option>
          </select>
          <input
            type="number"
            name="pityAtPull"
            min={1}
            max={90}
            defaultValue={entry.pityAtPull}
            required
            className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="bannerName"
            placeholder="Назва баннера"
            defaultValue={entry.bannerName}
            required
            className="min-w-[10rem] flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
          />
          <input
            type="text"
            name="itemName"
            placeholder="Здобутий персонаж / зброя"
            defaultValue={entry.itemName}
            required
            className="min-w-[10rem] flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {isPending ? "..." : "Зберегти"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-md px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800"
          >
            Скасувати
          </button>
        </div>
      </form>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
    </li>
  );
}

export default function PullList({ entries }: { entries: PullEntry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">Ще немає записів гача-логу</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-800">
      {entries.map((entry) =>
        editingId === entry.id ? (
          <EditRow key={entry.id} entry={entry} onDone={() => setEditingId(null)} />
        ) : (
          <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-100">
                {entry.itemName}{" "}
                <span
                  className={entry.result === "WIN" ? "text-emerald-400" : "text-red-400"}
                >
                  {entry.result === "WIN" ? "WIN" : "LOSE"}
                </span>
              </span>
              <span className="text-xs text-slate-500">
                {entry.date.toLocaleDateString("uk-UA", { timeZone: "UTC" })} ·{" "}
                {BANNER_LABEL[entry.bannerType]} · {entry.bannerName} · піті {entry.pityAtPull}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingId(entry.id)}
                className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-800 hover:text-amber-300"
              >
                Редагувати
              </button>
              <form action={deletePullEntry.bind(null, entry.id)}>
                <button
                  type="submit"
                  className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-red-950 hover:text-red-300"
                >
                  Видалити
                </button>
              </form>
            </span>
          </li>
        ),
      )}
    </ul>
  );
}
