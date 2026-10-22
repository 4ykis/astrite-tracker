"use client";

import { useOptimistic, useTransition } from "react";
import { setCollapseFinished } from "./actions";

/** Switches the "collapse finished heroes" mode: on, finished builds move to the strip and new ones follow automatically. */
export default function CollapseFinishedButton({ on }: { on: boolean }) {
  const [shownOn, setShownOn] = useOptimistic(on);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title={shownOn ? "Повернути готових героїв у список" : "Прибрати готових героїв зі списку, нові готові теж згортатимуться"}
      onClick={() =>
        startTransition(async () => {
          setShownOn(!shownOn);
          await setCollapseFinished(!shownOn);
        })
      }
      className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-emerald-500/70 hover:text-emerald-200 disabled:opacity-60"
    >
      {shownOn ? "Розгорнути всіх" : "Згорнути готових"}
    </button>
  );
}
