"use client";

import { useActionState, useEffect, useRef } from "react";
import { addPullEntry } from "./actions";

export default function PullForm() {
  const [state, formAction, isPending] = useActionState(addPullEntry, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bannerType" className="text-sm font-medium text-slate-300">
            Тип баннера
          </label>
          <select
            id="bannerType"
            name="bannerType"
            defaultValue="CHARACTER"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-400"
          >
            <option value="CHARACTER">Персонаж</option>
            <option value="WEAPON">Зброя</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="result" className="text-sm font-medium text-slate-300">
            Результат
          </label>
          <select
            id="result"
            name="result"
            defaultValue="WIN"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-400"
          >
            <option value="WIN">Win (рейтап)</option>
            <option value="LOSE">Lose (стандарт)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bannerName" className="text-sm font-medium text-slate-300">
          Назва баннера
        </label>
        <input
          id="bannerName"
          name="bannerName"
          type="text"
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="itemName" className="text-sm font-medium text-slate-300">
          Здобутий персонаж / зброя
        </label>
        <input
          id="itemName"
          name="itemName"
          type="text"
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pityAtPull" className="text-sm font-medium text-slate-300">
          Піті на момент отримання 5★
        </label>
        <input
          id="pityAtPull"
          name="pityAtPull"
          type="number"
          min={1}
          max={90}
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-400"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-amber-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
      >
        {isPending ? "..." : "Додати пул"}
      </button>
    </form>
  );
}
