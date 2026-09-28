"use client";

import { useTransition } from "react";
import { createBuild } from "./actions";

export default function AddBuildButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => createBuild())}
      aria-label="Додати сетап"
      className="flex h-32 w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 text-6xl font-extralight text-slate-500 transition hover:border-amber-400 hover:text-amber-300 disabled:opacity-60"
    >
      {isPending ? "…" : "+"}
    </button>
  );
}
