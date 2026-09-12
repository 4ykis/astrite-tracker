"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="passcode" className="text-sm font-medium text-slate-300">
          Код доступу
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          autoFocus
          required
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-400"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-amber-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
      >
        {isPending ? "Вхід..." : "Увійти"}
      </button>
    </form>
  );
}
