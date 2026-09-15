"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { BalanceEntry } from "@prisma/client";
import { deleteBalanceEntry, updateBalanceEntry } from "./actions";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function EditRow({ entry, onDone }: { entry: BalanceEntry; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState(
    updateBalanceEntry.bind(null, entry.id),
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
    <li className="flex flex-col gap-2 py-2">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          name="date"
          defaultValue={toDateInputValue(entry.date)}
          required
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
        />
        <input
          type="number"
          name="amount"
          min={0}
          step={1}
          defaultValue={entry.amount}
          required
          className="w-28 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
        />
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
      </form>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
    </li>
  );
}

export default function BalanceHistory({ entries }: { entries: BalanceEntry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">Ще немає записів балансу</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-800">
      {entries.map((entry) =>
        editingId === entry.id ? (
          <EditRow key={entry.id} entry={entry} onDone={() => setEditingId(null)} />
        ) : (
          <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-slate-300">
              {entry.date.toLocaleDateString("uk-UA", { timeZone: "UTC" })}{" "}
              <span className="font-medium text-slate-100">{entry.amount} astrite</span>
            </span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingId(entry.id)}
                className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-800 hover:text-amber-300"
              >
                Редагувати
              </button>
              <form action={deleteBalanceEntry.bind(null, entry.id)}>
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
