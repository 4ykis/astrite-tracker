"use client";

import { useActionState, useState } from "react";
import { saveTodayBalance } from "./actions";
import { PULL_COST } from "@/lib/gacha";

export default function BalanceForm({
  currentBalance,
  spentSince,
  today,
}: {
  currentBalance: number | null;
  spentSince: number;
  today: string;
}) {
  const [state, formAction, isPending] = useActionState(saveTodayBalance, undefined);
  const [showDate, setShowDate] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <label htmlFor="amount" className="text-sm font-medium text-slate-300">
          {showDate ? "Баланс astrite за дату" : "Баланс astrite сьогодні"}
        </label>
        {currentBalance !== null && (
          <span className="text-sm text-slate-500">
            Поточний: <span className="font-semibold text-amber-300">{currentBalance}</span>{" "}
            ({Math.floor(currentBalance / PULL_COST)} круток)
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          id="amount"
          name="amount"
          type="number"
          min={0}
          step={1}
          defaultValue={currentBalance ?? undefined}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={() => setShowDate((value) => !value)}
          aria-label={showDate ? "Записати на сьогодні" : "Вказати дату"}
          aria-pressed={showDate}
          title={showDate ? "Записати на сьогодні" : "Вказати дату"}
          className={`shrink-0 rounded-lg border px-3 py-2.5 transition ${
            showDate
              ? "border-amber-400 text-amber-300"
              : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-lg bg-amber-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
        >
          {isPending ? "..." : "Зберегти"}
        </button>
      </div>
      {showDate && (
        <input
          type="date"
          name="date"
          defaultValue={today}
          max={today}
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
        />
      )}
      {spentSince > 0 && (
        <p className="text-xs text-slate-500">
          Враховано −{spentSince} з гача-логу після останнього запису балансу
        </p>
      )}
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
