"use client";

import { useActionState } from "react";
import { saveTodayBalance } from "./actions";

const PULL_COST = 160;

export default function BalanceForm({ currentBalance }: { currentBalance: number | null }) {
  const [state, formAction, isPending] = useActionState(saveTodayBalance, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <label htmlFor="amount" className="text-sm font-medium text-slate-300">
          Баланс astrite сьогодні
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
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-lg bg-amber-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
        >
          {isPending ? "..." : "Зберегти"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
